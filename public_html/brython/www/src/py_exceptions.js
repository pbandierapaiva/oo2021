;(function($B){

var _b_ = $B.builtins

$B.del_exc = function(){
    var frame = $B.last($B.frames_stack)
    frame[1].$current_exception = undefined
}

$B.set_exc = function(exc){
    var frame = $B.last($B.frames_stack)
    if(frame === undefined){
        console.log("no frame", exc, exc.__class__, exc.args)
    }
    frame[1].$current_exception = $B.exception(exc)
}

$B.get_exc = function(){
    var frame = $B.last($B.frames_stack)
    return frame[1].$current_exception
}

$B.$raise = function(arg, context, cause){
    // Used for "raise" without specifying an exception.
    // If there is an exception in the stack, use it, else throw a simple
    // Exception
    if(arg === undefined){
        var es = $B.get_exc()
        if(es !== undefined){throw es}
        throw _b_.RuntimeError.$factory("No active exception to reraise")
    }else if(_b_.isinstance(arg, BaseException)){
        if(arg.__class__ === _b_.StopIteration &&
                $B.last($B.frames_stack)[1].$is_generator){
            // PEP 479
            arg = _b_.RuntimeError.$factory("generator raised StopIteration")
        }
        if(context === undefined){
            console.log('bizarre 1')
        }
        arg.__context__ = context
        arg.__cause__ = cause || _b_.None
        arg.__suppress_context__ = cause !== undefined
        throw arg
    }else if(arg.$is_class && _b_.issubclass(arg, BaseException)){
        if(arg === _b_.StopIteration){
            if($B.last($B.frames_stack)[1].$is_generator){
                // PEP 479
                throw _b_.RuntimeError.$factory("generator raised StopIteration")
            }
        }
        if(context === undefined){
            console.log('bizarre 2')
        }
        var exc = $B.$call(arg)()
        exc.__context__ = context
        exc.__cause__ = cause || _b_.None
        exc.__suppress_context__ = cause !== undefined
        throw exc
    }else{
        throw _b_.TypeError.$factory("exceptions must derive from BaseException")
    }
}

$B.$syntax_err_line = function(exc, module, src, pos, line_num){
    // map position to line number
    var pos2line = {},
        lnum = 1,
        module = module.charAt(0) == "$" ? "<string>" : module
    if(src === undefined){
        exc.$line_info = line_num + ',' + module
        exc.args = $B.fast_tuple([$B.$getitem(exc.args, 0),
            $B.fast_tuple([module, line_num, 0, 0])])
    }else{
        var line_pos = {1:0}
        for(var i = 0, len = src.length; i < len; i++){
            pos2line[i] = lnum
            if(src.charAt(i) == "\n"){line_pos[++lnum] = i}
        }
        while(line_num === undefined){
            line_num = pos2line[pos]
            pos--
        }
        exc.$line_info = line_num + "," + module

        var lines = src.split("\n"),
            line = lines[line_num - 1],
            lpos = pos - line_pos[line_num],
            len = line.length
        exc.text = line + '\n'
        lpos -= len - line.length
        if(lpos < 0){lpos = 0}
        while(line.charAt(0) == ' '){
            line = line.substr(1)
            if(lpos > 0){lpos--}
        }
        exc.offset = lpos + 1 // starts at column 1, not 0
        exc.args = $B.fast_tuple([$B.$getitem(exc.args, 0),
            $B.fast_tuple([module, line_num, lpos, line])])
    }
    exc.lineno = line_num
    exc.msg = exc.args[0]
    exc.filename = module
}

$B.$SyntaxError = function(module, msg, src, pos, line_num, root) {
    if(root !== undefined && root.line_info !== undefined){
        // this may happen for syntax errors inside a lambda
        line_num = root.line_info
    }
    var exc = _b_.SyntaxError.$factory(msg)
    $B.$syntax_err_line(exc, module, src, pos, line_num)
    throw exc
}

$B.$IndentationError = function(module, msg, src, pos, line_num, root,
        indented_node) {
    $B.frames_stack.push([module, {$line_info: line_num + "," + module},
        module, {$src: src}])
    if(root !== undefined && root.line_info !== undefined){
        // this may happen for syntax errors inside a lambda
        line_num = root.line_info
    }
    if(indented_node){
        var type = indented_node.context.tree[0].type
        switch(type){
            case 'class':
                type = 'class definition'
                break
            case 'condition':
                type = `'${indented_node.context.tree[0].token}' statement`
                break
            case 'def':
                type = 'function definition'
                break
            case 'case':
            case 'for':
            case 'match':
            case 'try':
            case 'while':
            case 'with':
                type = `'${type}' statement`
                break
            case 'single_kw':
                type = `'${indented_node.context.tree[0].token}' statement`
                break
        }
        msg += ` after ${type} on line ${indented_node.line_num}`
    }
    var exc = _b_.IndentationError.$factory(msg)
    $B.$syntax_err_line(exc, module, src, pos, line_num)
    throw exc
}

$B.print_stack = function(stack){
    stack = stack || $B.frames_stack
    var trace = []
    stack.forEach(function(frame){
        var line_info = frame[1].$line_info
        if(line_info !== undefined){
            var info = line_info.split(",")
            if(info[1].startsWith("$exec")){
                info[1] = "<module>"
            }
            trace.push(info[1] + " line " + info[0])
            var src = $B.file_cache[frame[3].__file__]
            if(src){
                var lines = src.split("\n"),
                    line = lines[parseInt(info[0]) - 1]
                trace.push("  " + line.trim())
            }
        }
    })
    console.log("print stack ok", trace)
    return trace.join("\n")
}

// class of traceback objects
var traceback = $B.traceback = $B.make_class("traceback",
    function(exc, stack){
        var frame = $B.last($B.frames_stack)
        if(stack === undefined){
            stack = exc.$stack
        }
        return {
            __class__ : traceback,
            $stack: stack,
            exc: exc
        }
    }
)

traceback.__getattribute__ = function(self, attr){
    var line_info
    if(attr === 'tb_frame' ||
            attr === 'tb_lineno' ||
            attr === 'tb_lasti' ||
            attr === 'tb_next'){
        if(self.$stack.length == 0){
            console.log("no stack", attr)
        }
        var first_frame = self.$stack[0]
        line_info = self.exc.$line_infos[self.exc.$line_infos.length -
            self.$stack.length]
    }

    switch(attr){
        case "tb_frame":
            return frame.$factory(self.$stack)
        case "tb_lineno":
            var lineno
            if(line_info === undefined ||
                    first_frame[0].startsWith($B.lambda_magic)){
                if(first_frame[4] && first_frame[4].$infos &&
                        first_frame[4].$infos.__code__){
                    lineno = first_frame[4].$infos.__code__.co_firstlineno
                }else{
                    lineno = -1
                }
            }else{
                lineno = parseInt(line_info.split(",")[0])
            }
            return lineno
        case "tb_lasti":
            if(line_info === undefined){
                console.log("no line info", self.$stack)
                return ""
            }else{
                var info = line_info.split(","),
                    src,
                    file
                for(var i = self.$stack.length - 1; i >= 0; i--){
                    var fr = self.$stack[i]
                    if(fr[2] == info[1].replace(/\./g, '_')){
                        file = fr[3].__file__
                        src = fr[3].$src
                        break
                    }
                }
                if(src === undefined){
                    if($B.file_cache.hasOwnProperty(file)){
                        src = $B.file_cache[file]
                    }else if($B.imported[info[1]] &&
                            $B.imported[info[1]].__file__ ){
                        src = $B.file_cache[$B.imported[info[1]].__file__]
                        console.log("from filecache", line_info,
                            $B.imported[info[1]].__file__)
                    }
                }
                if(src !== undefined){
                    try{
                        return src.split("\n")[parseInt(info[0] - 1)].trim()
                    }catch(err){
                        console.log("error in attr tb_lasti of", self)
                        console.log(src, info)
                        throw err
                    }
                }else{
                    console.log('stack', self.$stack)
                    console.log(file)
                    console.log("no src for", info)
                    return ""
                }
            }
        case "tb_next":
            if(self.$stack.length <= 1){return _b_.None}
            else{
                return traceback.$factory(self.exc,
                    self.$stack.slice(1))
            }
        default:
            return _b_.object.__getattribute__(self, attr)
    }
}

$B.set_func_names(traceback, "builtins")

// class of frame objects
var frame = $B.make_class("frame",
    function(stack, pos){
        var fs = stack
        var res = {
            __class__: frame,
            f_builtins : {}, // XXX fix me
            $stack: stack.slice()
        }
        if(pos === undefined){
            pos = 0
        }
        res.$pos = pos
        if(fs.length){
            var _frame = fs[pos],
                locals_id = _frame[0],
                filename
            try{
                res.f_locals = $B.obj_dict(_frame[1])
            }catch(err){
                console.log("err " + err)
                throw err
            }
            res.f_globals = $B.obj_dict(_frame[3])

            if(_frame[3].__file__ !== undefined){
                filename = _frame[3].__file__
            }
            if(locals_id.startsWith("$exec")){
                filename = "<string>"
            }
            if(_frame[1].$line_info === undefined){
                res.f_lineno = -1
            }else{
                var line_info = _frame[1].$line_info.split(",")
                res.f_lineno = parseInt(line_info[0])
                var module_name = line_info[1]
                if($B.imported.hasOwnProperty(module_name)){
                    filename = $B.imported[module_name].__file__
                }
                res.f_lineno = parseInt(_frame[1].$line_info.split(',')[0])
            }
            var co_name = locals_id.startsWith("$exec") ? "<module>" :
                          locals_id
            if(locals_id == _frame[2]){
                co_name = "<module>"
            }else if(locals_id.startsWith("lc" + $B.lambda_magic)){
                co_name = "<listcomp>"
            }else{
                if(_frame[1].$name){
                    co_name = _frame[1].$name
                }else if(_frame[1].$comprehension){
                    co_name = '<' + _frame[1].$comprehension + '>'
                }else if(_frame[1].$list_comp){
                    co_name = '<listcomp>'
                }else if(_frame.length > 4){
                    if(_frame[4].$infos){
                        co_name = _frame[4].$infos.__name__
                    }else{
                        co_name = _frame[4].name
                    }
                    if(_frame[4].$infos === undefined){
                        // issue 1286
                        if(_frame[4].name.startsWith("__ge")){
                            co_name = "<genexpr>"
                        }else if(_frame[4].name.startsWith("set_comp" +
                                $B.lambda_magic)){
                            co_name = "<setcomp>"
                        }else if(_frame[4].name.startsWith("lambda" +
                                $B.lambda_magic)){
                            co_name = "<lambda>"
                        }
                    }else if(filename === undefined && _frame[4].$infos.__code__){
                        filename = _frame[4].$infos.__code__.co_filename
                        if(filename === undefined){
                            filename = _frame[4].$infos.__module__
                        }
                        res.f_lineno = _frame[4].$infos.__code__.co_firstlineno
                    }
                }
            }
            if(_frame.length > 4 && _frame[4].$infos !== undefined){
                res.f_code = _frame[4].$infos.__code__
            }else{
                res.f_code = {
                    co_name: co_name,
                    co_filename: filename
                }
                if(_frame[1].$comp_code){
                    $B.update_obj(res.f_code, _frame[1].$comp_code)
                }
            }
            res.f_code.__class__ = $B.code
            res.f_code.co_code = _b_.None
            if(filename === undefined){
                res.f_code.co_filename = "<string>"
            }
        }
        return res
    }
)

frame.__delattr__ = function(self, attr){
    if(attr == "f_trace"){
        $B.last(self.$stack)[1].$f_trace = _b_.None
    }
}

frame.__getattr__ = function(self, attr){
    // Used for f_back to avoid computing it when the frame object
    // is initialised
    if(attr == "f_back"){
        if(self.$pos > 0){
            return frame.$factory(self.$stack.slice(0, self.$stack.length - 1),
                self.$pos - 1)
        }else{
            return _b_.None
        }
    }else if(attr == "clear"){
        return function(){
            // XXX fix me
        }
    }else if(attr == "f_trace"){
        var locals = $B.last(self.$stack)[1]
        if(locals.$f_trace === undefined){
            return _b_.None
        }
        return locals.$f_trace
    }
}

frame.__setattr__ = function(self, attr, value){
    if(attr == "f_trace"){
        // used in trace functions, as defined by sys.settrace()
        $B.last(self.$stack)[1].$f_trace = value
    }
}

frame.__str__ = frame.__repr__ = function(self){
    return '<frame object, file ' + self.f_code.co_filename +
        ', line ' + self.f_lineno + ', code ' + self.f_code.co_name + '>'
}

$B.set_func_names(frame, "builtins")
$B._frame = frame // used in builtin_modules.js


// built-in exceptions

var BaseException = _b_.BaseException =  {
    __class__: _b_.type,
    __bases__ : [_b_.object],
    __mro__: [_b_.object],
    args: [],
    $infos:{
        __name__: "BaseException",
        __module__: "builtins"
    },
    $is_class: true
}

BaseException.__init__ = function(self){
    var args = arguments[1] === undefined ? [] : [arguments[1]]
    self.args = _b_.tuple.$factory(args)
}

BaseException.__repr__ = function(self){
    var res =  self.__class__.$infos.__name__ + '('
    if(self.args[0] !== undefined){
        res += _b_.repr(self.args[0])
    }
    if(self.args.length > 1){
        res += ', ' + _b_.repr($B.fast_tuple(self.args.slice(1)))
    }
    return res + ')'
}

BaseException.__str__ = function(self){
    if(self.args.length > 0 && self.args[0] !== _b_.None){
        return _b_.str.$factory(self.args[0])
    }
    return ''
}

BaseException.__new__ = function(cls){
    var err = _b_.BaseException.$factory()
    err.__class__ = cls
    err.__dict__ = $B.empty_dict()
    return err
}

var getExceptionTrace = function(exc, includeInternal) {
    if(exc.__class__ === undefined){
        if($B.debug > 1){console.log("no class", exc)}
        return exc + ''
    }

    var info = ''
    if(exc.$js_exc !== undefined && includeInternal){
        info += "\nJS stack:\n" + exc.$js_exc.stack + "\n"
    }
    info += "Traceback (most recent call last):"
    var line_info = exc.$line_info

    for(var i = 0; i < exc.$stack.length; i++){
        var frame = exc.$stack[i]
        if(! frame[1] || ! frame[1].$line_info){
            continue
        }
        var $line_info = frame[1].$line_info
        var line_info = $line_info.split(','),
            src
        if(exc.module == line_info[1]){
            src = exc.src
        }
        if(!includeInternal){
            var src = frame[3].$src
            if(src === undefined){
                if($B.VFS && $B.VFS.hasOwnProperty(frame[2])){
                    src = $B.VFS[frame[2]][1]
                }else if(src = $B.file_cache[frame[3].__file__]){
                    // For imported modules, cf. issue 981
                }else{
                    continue
                }
            }
        }
        var file = frame[3].__file__ || "<string>",
            module = line_info[1],
            is_exec = module.charAt(0) == "$"
        if(is_exec){
            module = "<module>"
        }
        info += "\n  File " + file + " line " + line_info[0]
        if(frame.length > 4){
            if(frame[4].$infos){
                var name = frame[4].$infos.__name__
                if(name.startsWith("lc" + $B.lambda_magic)){
                    info += ', in <listcomp>'
                }else if(name.startsWith("lambda_" + $B.lambda_magic)){
                    info += ', in <lambda>'
                }else{
                    info += ', in ' + name
                }
            }else if(frame[4].name.startsWith("__ge")){
                info += ', in <genexpr>'
            }else if(frame[4].name.startsWith("set_comp" + $B.lambda_magic)){
                info += ', in <setcomp>'
            }else if(frame[4].name.startsWith("lc" + $B.lambda_magic)){
                info += ', in <listcomp>'
            }else{
                console.log("frame[4]", frame[4])
            }
        }else if(frame[1].$list_comp){
            info += ', in <listcomp>'
        }else if(frame[1].$dict_comp){
            info += ', in <dictcomp>'
        }else{
            info += ', in <module>'
        }

        if(src !== undefined && ! is_exec){
            var lines = src.split("\n"),
                line = lines[parseInt(line_info[0]) - 1]
            if(line){line = line.replace(/^[ ]+/g, "")}
            info += "\n    " + line
        }
    }
    if(exc.__class__ === _b_.SyntaxError){
        info += "\n  File " + exc.args[1][0] + ", line " +
            exc.args[1][1] + "\n    " + exc.args[1][3]

    }
    return info
}

BaseException.__getattr__ = function(self, attr){

    if(attr == "info"){
        return getExceptionTrace(self, false);
    }else if (attr == "infoWithInternal"){
        return getExceptionTrace(self, true);
    }else if(attr == "__traceback__"){
        // Return traceback object
        if(self.$traceback !== undefined){return self.$traceback}
        return traceback.$factory(self)
    }else{
        throw $B.attr_error(attr, self)
    }
}

BaseException.with_traceback = function(self, tb){
    self.$traceback = tb
    return self
}

$B.deep_copy = function(stack){
    var res = []
    for(const s of stack){
        var item = [s[0], {}, s[2], {}]
        if(s[4] !== undefined){item.push(s[4])}
        for(const i of [1, 3]){
            for(var key in s[i]){
                item[i][key] = s[i][key]
            }
        }
        res.push(item)
    }
    return res
}

$B.save_stack = function(){
    return $B.deep_copy($B.frames_stack)
}

$B.restore_stack = function(stack, locals){
    $B.frames_stack = stack
    $B.frames_stack[$B.frames_stack.length - 1][1] = locals
}

$B.freeze = function(err){
    // Store line numbers in frames stack when the exception occured
    if(err.$stack === undefined){
        err.$line_infos = []
        for(var i = 0, len = $B.frames_stack.length; i < len; i++){
            err.$line_infos.push($B.frames_stack[i][1].$line_info)
        }
        // Make a copy of the current frames stack array
        err.$stack = $B.frames_stack.slice()
        if($B.frames_stack.length){
            err.$line_info = $B.last($B.frames_stack)[1].$line_info
        }
    }
}

var show_stack = $B.show_stack = function(stack){
    stack = stack || $B.frames_stack
    for(const frame of stack){
        console.log(frame[0], frame[1].$line_info)
    }
}

// Source code for BaseException. Used in make_exc to generate all the
// exceptions.
// Must be defined as a string: if BaseException.$factory is defined as a
// function and the function code source is used to generate the other
// exceptions, this code source might be changed by a JS code minifier...
// (cf issue #1806)
// The line '// placeholder' is meant to be replaced by exception-specific
// code passed to make_exc()
var be_factory = `
function (){
    var err = Error()
    err.args = $B.fast_tuple(Array.prototype.slice.call(arguments))
    err.__class__ = _b_.BaseException
    err.$py_error = true
    $B.freeze(err)
    // placeholder
    err.__cause__ = _b_.None // XXX fix me
    err.__context__ = _b_.None // XXX fix me
    err.__suppress_context__ = false // XXX fix me
    return err
}`

eval('BaseException.$factory = ' + be_factory)

BaseException.$factory.$infos = {
    __name__: "BaseException",
    __qualname__: "BaseException"
}

$B.set_func_names(BaseException)

_b_.BaseException = BaseException

$B.exception = function(js_exc, in_ctx_manager){
    // thrown by eval(), exec() or by a function
    // js_exc is the Javascript exception, which can be raised by the
    // code generated by Python - in this case it has attribute $py_error set -
    // or by the Javascript interpreter (ReferenceError for instance)
    if(! js_exc.__class__){
        var exc = Error()
        exc.__name__ = "Internal Javascript error: " +
            (js_exc.__name__ || js_exc.name)
        exc.__class__ = _b_.Exception
        exc.$js_exc = js_exc
        if($B.is_recursion_error(js_exc)){
            return _b_.RecursionError.$factory("too much recursion")
        }else if(js_exc.name == "ReferenceError"){
            exc.__name__ = "NameError"
            exc.__class__ = _b_.NameError
        }else if(js_exc.name == "InternalError"){
            exc.__name__ = "RuntimeError"
            exc.__class__ = _b_.RuntimeError
        }
        exc.__cause__ = _b_.None
        exc.__context__ = _b_.None
        exc.__suppress_context__ = false
        var $message = "<Javascript " + js_exc.name + ">: " +
            (js_exc.message || "<" + js_exc + ">")
        exc.args = _b_.tuple.$factory([$message])
        exc.$py_error = true
        console.log('js error', exc.args, exc.__class__)
        console.log(js_exc.stack)
        $B.freeze(exc)
    }else{
        var exc = js_exc
        $B.freeze(exc)
        if(in_ctx_manager){
            // Is this documented anywhere ? For exceptions raised inside a
            // context manager, the frames stack starts at the current
            // local level.
            var current_locals = $B.last($B.frames_stack)[0]
            for(var i = 0, len = exc.$stack.length; i < len; i++){
                if(exc.$stack[i][0] == current_locals){
                    exc.$stack = exc.$stack.slice(i)
                    exc.$traceback = traceback.$factory(exc)
                    break
                }
            }
        }
    }
    return exc
}

$B.is_exc = function(exc, exc_list){
    // used in try/except to check if an exception is an instance of
    // one of the classes in exc_list
    if(exc.__class__ === undefined){
        exc = $B.exception(exc)
    }

    var this_exc_class = exc.$is_class ? exc : exc.__class__
    for(var i = 0; i < exc_list.length; i++){
        var exc_class = exc_list[i]
        if(this_exc_class === undefined){console.log("exc class undefined", exc)}
        if(_b_.issubclass(this_exc_class, exc_class)){return true}
    }
    return false
}

$B.is_recursion_error = function(js_exc){
    // Test if the JS exception matches Python RecursionError
    var msg = js_exc + "",
        parts = msg.split(":"),
        err_type = parts[0].trim(),
        err_msg = parts[1].trim()
    return (err_type == 'InternalError' && err_msg == 'too much recursion') ||
        (err_type == 'Error' && err_msg == 'Out of stack space') ||
        (err_type == 'RangeError' && err_msg == 'Maximum call stack size exceeded')
}

function $make_exc(names, parent){
    // Creates the exception classes that inherit from parent
    // names is the list of exception names
    if(parent === undefined){
        console.log('pas de parent', names)
    }
    var _str = [], pos = 0
    for(var i = 0; i < names.length; i++){
        var name = names[i],
            code = ""
        if(Array.isArray(name)){
            // If name is an array, its first item is the exception name
            // and the second is a piece of code to replace the placeholder
            // in BaseException source code
            var code = name[1],
                name = name[0]
        }
        // create a class for exception called "name"
        $B.builtins_scope[name] = true
        var $exc = (be_factory).replace(/BaseException/g,name)
        $exc = $exc.replace("// placeholder", code)
        // class dictionary
        _str[pos++] = "_b_." + name + ' = {__class__:_b_.type, ' +
            '__bases__: [_b_.' + parent.$infos.__name__ + '], ' +
            '__mro__: [_b_.' + parent.$infos.__name__ +
            "].concat(parent.__mro__), $is_class: true," +
            "$infos: {__name__:'" + name + "'}}"
        _str[pos++] = "_b_." + name + ".$factory = " + $exc
        _str[pos++] = "_b_." + name + '.$factory.$infos = {__name__: "' +
            name + '", __qualname__: "' + name + '"}'
        _str[pos++] = "$B.set_func_names(_b_." + name + ", 'builtins')"
    }
    try{
        eval(_str.join(";"))
    }catch(err){
        console.log("--err" + err)
        throw err
    }
}

$make_exc(["SystemExit", "KeyboardInterrupt", "GeneratorExit", "Exception"],
    BaseException)
$make_exc([["StopIteration","err.value = arguments[0]"],
    ["StopAsyncIteration","err.value = arguments[0]"],
    "ArithmeticError", "AssertionError", "BufferError", "EOFError",
    ["ImportError", "err.name = arguments[0]"],
    "LookupError", "MemoryError",
    "OSError", "ReferenceError", "RuntimeError",
    ["SyntaxError", "err.msg = arguments[0]"],
    "SystemError", "TypeError", "ValueError", "Warning"], _b_.Exception)
$make_exc(["FloatingPointError", "OverflowError", "ZeroDivisionError"],
    _b_.ArithmeticError)
$make_exc([["ModuleNotFoundError", "err.name = arguments[0]"]], _b_.ImportError)
$make_exc(["IndexError","KeyError"], _b_.LookupError)
$make_exc(["BlockingIOError", "ChildProcessError", "ConnectionError",
    "FileExistsError", "FileNotFoundError", "InterruptedError",
    "IsADirectoryError", "NotADirectoryError", "PermissionError",
    "ProcessLookupError", "TimeoutError"], _b_.OSError)
$make_exc(["BrokenPipeError", "ConnectionAbortedError",
    "ConnectionRefusedError", "ConnectionResetError"], _b_.ConnectionError)
$make_exc(["NotImplementedError", "RecursionError"], _b_.RuntimeError)
$make_exc(["IndentationError"], _b_.SyntaxError)
$make_exc(["TabError"], _b_.IndentationError)
$make_exc(["UnicodeError"], _b_.ValueError)
$make_exc(["UnicodeDecodeError", "UnicodeEncodeError",
    "UnicodeTranslateError"], _b_.UnicodeError)
$make_exc(["DeprecationWarning", "PendingDeprecationWarning",
    "RuntimeWarning", "SyntaxWarning", "UserWarning", "FutureWarning",
    "ImportWarning", "UnicodeWarning", "BytesWarning", "ResourceWarning",
    "EncodingWarning"],
    _b_.Warning)
$make_exc(["EnvironmentError", "IOError", "VMSError", "WindowsError"],
    _b_.OSError)

// AttributeError supports keyword-only "name" and "obj" parameters
var js = '\nvar $ = $B.args("AttributeError", 1, {"msg": null, "name":null, "obj":null}, ' +
    '["msg", "name", "obj"], arguments, ' +
    '{msg: _b_.None, name: _b_.None, obj: _b_.None}, "*", null);\n' +
    'err.args = $B.fast_tuple($.msg === _b_.None ? [] : [$.msg])\n;' +
    'err.name = $.name\nerr.obj = $.obj\n'

$make_exc([["AttributeError", js]], _b_.Exception)

_b_.AttributeError.__str__ = function(self){
    var msg =  self.args[0]
    var suggestion = offer_suggestions_for_attribute_error(self)
    if(suggestion){
        msg += `. Did you mean: '${suggestion}'?`
    }
    return msg
}

$B.set_func_names(_b_.AttributeError, 'builtins')

// Shortcut to create an AttributeError
$B.attr_error = function(name, obj){
    if(obj.$is_class){
        var msg = `type object '${obj.$infos.__name__}'`
    }else{
        var msg = `'${$B.class_name(obj)}' object`
    }
    msg +=  ` has no attribute '${name}'`
    return _b_.AttributeError.$factory({$nat:"kw",kw:{name, obj, msg}})
}

// NameError supports keyword-only "name" parameter
var js = '\nvar $ = $B.args("NameError", 1, {"msg": null, "name":null}, ' +
    '["msg", "name"], arguments, ' +
    '{msg: _b_.None, name: _b_.None}, "*", null);\n' +
    'err.args = $B.fast_tuple($.msg === _b_.None ? [] : [$.msg])\n;' +
    'err.name = $.name\n'

$make_exc([["NameError", js]], _b_.Exception)

_b_.NameError.__str__ = function(self){
    if(self.args.length > 0){
        return self.args[0]
    }
    var msg = `name '${self.name}' is not defined`,
        suggestion = offer_suggestions_for_name_error(self)
    if(suggestion){
        msg += `. Did you mean: '${suggestion}'?`
    }
    return msg
}

$B.set_func_names(_b_.NameError, 'builtins')

$make_exc(["UnboundLocalError"], _b_.NameError)

// Shortcut to create a NameError
$B.name_error = function(name, obj){
    return _b_.NameError.$factory({$nat:"kw",kw:{name}})
}

$B.$TypeError = function(msg){
    throw _b_.TypeError.$factory(msg)
}

// SyntaxError instances have special attributes
var se = _b_.SyntaxError.$factory
_b_.SyntaxError.$factory = function(){
    var arg = arguments[0]
    if(arg.__class__ === _b_.SyntaxError){
        return arg
    }
    var exc = se.apply(null, arguments),
        frame = $B.last($B.frames_stack)
    if(frame){
        line_info = frame[1].$line_info
        exc.filename = frame[3].__file__
        exc.lineno = parseInt(line_info.split(",")[0])
        var src = $B.file_cache[frame[3].__file__]
        if(src){
            lines = src.split("\n")
            exc.text = lines[exc.lineno - 1]
        }
        exc.offset = arg.offset
    }
    return exc
}

// Suggestions in case of NameError or AttributeError
var MAX_CANDIDATE_ITEMS = 750,
    MAX_STRING_SIZE = 40,
    MOVE_COST = 2,
    CASE_COST = 1,
    SIZE_MAX = 65535

function LEAST_FIVE_BITS(n){
    return ((n) & 31)
}

function levenshtein_distance(a, b, max_cost){
    // Compute Leveshtein distance between strings a and b
    if(a == b){
        return 0
    }
    if(a.length < b.length){
        [a, b] = [b, a]
    }

    while(a.length && a[0] == b[0]){
        a = a.substr(1)
        b = b.substr(1)
    }
    while(a.length && a[a.length - 1] == b[b.length - 1]){
        a = a.substr(0, a.length - 1)
        b = b.substr(0, b.length - 1)
    }
    if(b.length == 0){
        return a.length * MOVE_COST
    }
    if ((b.length - a.length) * MOVE_COST > max_cost){
        return max_cost + 1
    }
    var buffer = []
    for(var i = 0; i < a.length; i++) {
        // cost from b[:0] to a[:i+1]
        buffer[i] = (i + 1) * MOVE_COST
    }
    var result = 0
    for(var b_index = 0; b_index < b.length; b_index++) {
        var code = b[b_index]
        // cost(b[:b_index], a[:0]) == b_index * MOVE_COST
        var distance = result = b_index * MOVE_COST;
        var minimum = SIZE_MAX;
        for(var index = 0; index < a.length; index++) {
            // 1) Previous distance in this row is cost(b[:b_index], a[:index])
            var substitute = distance + substitution_cost(code, a[index])
            // 2) cost(b[:b_index], a[:index+1]) from previous row
            distance = buffer[index]
            // 3) existing result is cost(b[:b_index+1], a[index])
            var insert_delete = Math.min(result, distance) + MOVE_COST
            result = Math.min(insert_delete, substitute)

            buffer[index] = result
            if (result < minimum) {
                minimum = result
            }
        }
        if (minimum > max_cost) {
            // Everything in this row is too big, so bail early.
            return max_cost + 1
        }
    }
    return result
}

function substitution_cost(a, b){
    if(LEAST_FIVE_BITS(a) != LEAST_FIVE_BITS(b)){
        // Not the same, not a case flip.
        return MOVE_COST
    }
    if(a == b){
        return 0
    }
    if(a.toLowerCase() == b.toLowerCase()){
        return CASE_COST
    }
    return MOVE_COST
}
function calculate_suggestions(dir, name){
    if(dir.length >= MAX_CANDIDATE_ITEMS) {
        return null
    }

    var suggestion_distance = 2 ** 52,
        suggestion = null

    for(var item of dir){
        // No more than 1/3 of the involved characters should need changed.
        var max_distance = (name.length + item.length + 3) * MOVE_COST / 6
        // Don't take matches we've already beaten.
        max_distance = Math.min(max_distance, suggestion_distance - 1)
        var current_distance =
            levenshtein_distance(name, item, max_distance)
        if(current_distance > max_distance){
            continue
        }
        if(!suggestion || current_distance < suggestion_distance){
            suggestion = item
            suggestion_distance = current_distance
        }
    }
    return suggestion
}

function offer_suggestions_for_attribute_error(exc){
    var name = exc.name,
        obj = exc.obj
    var dir = _b_.dir(obj),
        suggestions = calculate_suggestions(dir, name)
    return suggestions
}

function offer_suggestions_for_name_error(exc){
    var name = exc.name,
        frame = $B.last(exc.$stack)
    var locals = Object.keys(frame[1]).filter(x => ! (x.startsWith('$')))
    var suggestion = calculate_suggestions(locals, name)
    if(suggestion){
        return suggestion
    }
    if(frame[2] != frame[0]){
        var globals = Object.keys(frame[3]).filter(x => ! (x.startsWith('$')))
        var suggestion = calculate_suggestions(globals, name)
        if(suggestion){
            return suggestion
        }
    }
}

$B.handle_error = function(err){
    // Print the error traceback on the standard error stream
    if(err.$handled){
        return
    }
    err.$handled = true
    if($B.debug > 1){
        console.log("handle error", err.__class__, err.args, 'stderr', $B.stderr)
        console.log(err)
    }
    if(err.__class__ !== undefined){
        var name = $B.class_name(err),
            trace = $B.$getattr(err, 'info')
        if(name == 'SyntaxError' || name == 'IndentationError'){
            var offset = err.args[1][2]
            trace += '\n    ' + ' '.repeat(offset) + '^' +
                '\n' + name + ': '+ err.args[0]
        }else{
            trace += '\n' + name + ': ' + _b_.str.$factory(err)
        }
    }else{
        console.log(err)
        trace = err + ""
    }
    try{
        $B.$getattr($B.stderr, 'write')(trace)
        var flush = $B.$getattr($B.stderr, 'flush', _b_.None)
        if(flush !== _b_.None){
            flush()
        }
    }catch(print_exc_err){
        console.debug(trace)
    }
    // Throw the error to stop execution
    throw err
}

})(__BRYTHON__)
