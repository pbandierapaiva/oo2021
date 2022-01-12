;(function($B){

var _b_ = $B.builtins,
    _window = self,
    isWebWorker = ('undefined' !== typeof WorkerGlobalScope) &&
            ("function" === typeof importScripts) &&
            (navigator instanceof WorkerNavigator)

$B.args = function(fname, argcount, slots, var_names, args, $dobj,
    extra_pos_args, extra_kw_args){
    // builds a namespace from the arguments provided in $args
    // in a function defined as
    //     foo(x, y, z=1, *args, u, v, **kw)
    // the parameters are
    //     fname = "f"
    //     argcount = 3 (for x, y , z)
    //     slots = {x:null, y:null, z:null, u:null, v:null}
    //     var_names = ['x', 'y', 'z', 'u', 'v']
    //     $dobj = {'z':1}
    //     extra_pos_args = 'args'
    //     extra_kw_args = 'kw'
    //     kwonlyargcount = 2
    if(fname.startsWith("lambda_" + $B.lambda_magic)){
        fname = "<lambda>"
    }
    var has_kw_args = false,
        nb_pos = args.length,
        filled = 0,
        extra_kw,
        only_positional

    // If the function definition indicates the end of positional arguments,
    // store the position and remove "/" from variable names
    var end_positional = var_names.indexOf("/")
    if(end_positional != -1){
        var_names.splice(end_positional, 1)
        only_positional = var_names.slice(0, end_positional)
    }

    // If the function call had keywords arguments, they are in the last
    // element of $args
    if(nb_pos > 0 && args[nb_pos - 1] && args[nb_pos - 1].$nat){
        nb_pos--
        if(Object.keys(args[nb_pos].kw).length > 0){
            has_kw_args = true
            var kw_args = args[nb_pos].kw
            if(Array.isArray(kw_args)){
                var kwa = kw_args[0]
                for(var i = 1, len = kw_args.length; i < len; i++){
                    var kw_arg = kw_args[i]
                    if(kw_arg.__class__ === _b_.dict){
                        for(var k in kw_arg.$numeric_dict){
                            throw _b_.TypeError.$factory(fname +
                                "() keywords must be strings")
                        }
                        for(var k in kw_arg.$object_dict){
                            throw _b_.TypeError.$factory(fname +
                                "() keywords must be strings")
                        }
                        for(var k in kw_arg.$string_dict){
                            if(kwa[k] !== undefined){
                                throw _b_.TypeError.$factory(fname +
                                    "() got multiple values for argument '" +
                                    k + "'")
                            }
                            kwa[k] = kw_arg.$string_dict[k][0]
                        }
                    }else{
                        var it = _b_.iter(kw_arg),
                            getitem = $B.$getattr(kw_arg, '__getitem__')
                        while(true){
                            try{
                                var k = _b_.next(it)
                                if(typeof k !== "string"){
                                    throw _b_.TypeError.$factory(fname +
                                        "() keywords must be strings")
                                }
                                if(kwa[k] !== undefined){
                                    throw _b_.TypeError.$factory(fname +
                                        "() got multiple values for argument '" +
                                        k + "'")
                                }
                                kwa[k] = getitem(k)
                            }catch(err){
                                if($B.is_exc(err, [_b_.StopIteration])){
                                    break
                                }
                                throw err
                            }
                        }
                    }
                }
                kw_args = kwa
            }
        }
    }

    if(extra_pos_args){
        slots[extra_pos_args] = []
        slots[extra_pos_args].__class__ = _b_.tuple
    }
    if(extra_kw_args){
        // Build a dict object faster than with _b_.dict()
        extra_kw = $B.empty_dict()
    }

    if(nb_pos > argcount){
        // More positional arguments than formal parameters
        if(extra_pos_args === null || extra_pos_args == "*"){
            // No parameter to store extra positional arguments :
            // thow an exception
            msg = fname + "() takes " + argcount + " positional argument" +
                (argcount > 1 ? "s" : "") + " but more were given"
            throw _b_.TypeError.$factory(msg)
        }else{
            // Store extra positional arguments
            for(var i = argcount; i < nb_pos; i++){
                slots[extra_pos_args].push(args[i])
            }
            // For the next step of the algorithm, only use the arguments
            // before these extra arguments
            nb_pos = argcount
        }
    }

    // Fill slots with positional (non-extra) arguments
    for(var i = 0; i < nb_pos; i++){
        slots[var_names[i]] = args[i]
        filled++
    }

    if(filled == argcount && argcount === var_names.length &&
            ! has_kw_args){
        if(extra_kw_args){
            slots[extra_kw_args] = extra_kw
        }
        return slots
    }

    // Then fill slots with keyword arguments, if any
    if(has_kw_args){
        for(var key in kw_args){
            var value = kw_args[key]
            if(slots[key] === undefined){
                // The name of the keyword argument doesn't match any of the
                // formal parameters
                if(extra_kw_args){
                    // If there is a place to store extra keyword arguments
                    extra_kw.$string_dict[key] = [value, extra_kw.$order++]
                }else{
                    throw _b_.TypeError.$factory(fname +
                        "() got an unexpected keyword argument '" + key + "'")
                }
            }else if(slots.hasOwnProperty(key) && slots[key] !== null){
                // The slot is already filled
                if(key == extra_pos_args){
                    throw _b_.TypeError.$factory(
                        `${fname}() got an unexpected ` +
                        `keyword argument '${key}'`)
                }
                throw _b_.TypeError.$factory(fname +
                    "() got multiple values for argument '" + key + "'")
            }else if(only_positional && only_positional.indexOf(key) > -1){
                throw _b_.TypeError.$factory(fname + "() got an " +
                    "unexpected keyword argument '" + key + "'")
            }else{
                // Fill the slot with the key/value pair
                slots[key] = value
            }
        }
    }

    // If there are unfilled slots, see if there are default values
    var missing = []
    for(var attr in slots){
        if(slots[attr] === null){
            if($dobj[attr] !== undefined){
                slots[attr] = $dobj[attr]
            }else{
                missing.push("'" + attr + "'")
            }
        }
    }


    if(missing.length > 0){

        if(missing.length == 1){
            throw _b_.TypeError.$factory(fname +
                " missing 1 positional argument: " + missing[0])
        }else{
            var msg = fname + " missing " + missing.length +
                " positional arguments: "
            msg += missing.join(" and ")
            throw _b_.TypeError.$factory(msg)
        }

    }

    if(extra_kw_args){
        slots[extra_kw_args] = extra_kw
    }

    return slots

}

$B.wrong_nb_args = function(name, received, expected, positional){
    if(received < expected){
        var missing = expected - received
        throw _b_.TypeError.$factory(name + "() missing " + missing +
            " positional argument" + (missing > 1 ? "s" : "") + ": " +
            positional.slice(received))
    }else{
        throw _b_.TypeError.$factory(name + "() takes " + expected +
            " positional argument" + (expected > 1 ? "s" : "") +
            " but more were given")
    }
}


$B.get_class = function(obj){
    // generally we get the attribute __class__ of an object by obj.__class__
    // but Javascript builtins used by Brython (functions, numbers, strings...)
    // don't have this attribute so we must return it

    if(obj === null){return $B.$NoneDict}
    if(obj === undefined){return $B.UndefinedClass} // in builtin_modules.js
    var klass = obj.__class__
    if(klass === undefined){
        switch(typeof obj) {
            case "number":
                if(obj % 1 === 0){ // this is an int
                   return _b_.int
                }
                // this is a float
                return _b_.float
            case "string":
                return _b_.str
            case "boolean":
                return _b_.bool
            case "function":
                // Functions defined in Brython have an attribute $infos
                if(obj.$is_js_func){
                    // Javascript function or constructor
                    return $B.JSObj
                }
                obj.__class__ = $B.Function
                return $B.Function
            case "object":
                if(Array.isArray(obj)){
                    if(Object.getPrototypeOf(obj) === Array.prototype){
                        obj.__class__ = _b_.list
                        return _b_.list
                    }
                }else if(obj.constructor === Number){
                    return _b_.float
                }else if(typeof Node !== "undefined" // undefined in Web Workers
                        && obj instanceof Node){
                    if(obj.tagName){
                        return $B.imported['browser.html'][obj.tagName] ||
                                   $B.DOMNode
                    }
                    return $B.DOMNode
                }
                break
        }
    }
    if(klass === undefined){
        return $B.JSObj
    }
    return klass
}

$B.class_name = function(obj){
    var klass = $B.get_class(obj)
    if(klass === $B.JSObj){
        return 'Javascript ' + obj.constructor.name
    }else{
        return klass.$infos.__name__
    }
}

$B.next_of = function(iterator){
    // return the function that produces the next item in an iterator
    if(iterator.__class__ === _b_.range){
        var obj = {ix: iterator.start}
        if(iterator.step > 0){
            return function(){
                if(obj.ix >= iterator.stop){
                    throw _b_.StopIteration.$factory('')
                }
                var res = obj.ix
                obj.ix += iterator.step
                return res
            }
        }else{
            return function(){
                if(obj.ix <= iterator.stop){
                    throw _b_.StopIteration.$factory('')
                }
                var res = obj.ix
                obj.ix += iterator.step
                return res
            }
        }
    }
    return $B.$call($B.$getattr(_b_.iter(iterator), '__next__'))
}

$B.unpacker = function(obj, nb_targets, has_starred, nb_after_starred){
    // Used in unpacking target of a "for" loop if it is a tuple or list
    var t = _b_.list.$factory(obj),
        len = t.length,
        min_len = has_starred ? len - 1 : len
    if(len < min_len){
        throw _b_.ValueError.$factory(
            `not enough values to unpack (expected ${min_length}, got ${len})`)
    }
    if((! has_starred) && len > nb_targets){
        console.log('iterable', obj, 't', t, 'nb_targets', nb_targets)
        throw _b_.ValueError.$factory(
            `too many values to unpack (expected ${nb_targets})`)
    }
    t.index = -1
    t.read_one = function(){
        t.index++
        return t[t.index]
    }
    t.read_rest = function(){
        t.index++
        var res = t.slice(t.index, t.length - nb_after_starred)
        t.index = t.length - nb_after_starred - 1
        return res
    }
    return t
}

$B.rest_iter = function(next_func){
    // Read the rest of an iterable
    // Used in assignment to a starred item
    var res = []
    while(true){
        try{
            res.push(next_func())
        }catch(err){
            if($B.is_exc(err, [_b_.StopIteration])){
                return $B.fast_tuple(res)
            }
            throw err
        }
    }
}

$B.copy_namespace = function(){
    var ns = {}
    for(const frame of $B.frames_stack){
        for(const kv of [frame[1], frame[3]]){
            for(var key in kv){
                if(! key.startsWith('$')){
                    ns[key] = kv[key]
                }
            }
        }
    }
    return ns
}

$B.clear_ns = function(name){
    // Remove name from __BRYTHON__.modules, and all the keys that start with name
    if(name.startsWith("__ge")){console.log("clear ns", name)}
    var len = name.length
    $B.$py_src[name] = null
    delete $B.$py_src[name]

    var alt_name = name.replace(/\./g, "_")
    if(alt_name != name){$B.clear_ns(alt_name)}
}

// Function used to resolve names not defined in Python source
// but introduced by "from A import *" or by exec

$B.$search = function(name, global_ns){
    // search in local and global namespaces
    var frame = $B.last($B.frames_stack)
    if(frame[1][name] !== undefined){return frame[1][name]}
    else if(frame[3][name] !== undefined){return frame[3][name]}
    else if(_b_[name] !== undefined){return _b_[name]}
    else{
        if(frame[0] == frame[2] || frame[1].$type == "class" ||
                frame[1].$exec_locals){
            throw $B.name_error(name)
        }else{
            throw _b_.UnboundLocalError.$factory("local variable '" +
                name + "' referenced before assignment")
        }
    }
}

$B.$global_search = function(name, search_ids){
    // search in all namespaces above current stack frame
    var ns = {}
    for(var i = 0; i < $B.frames_stack.length; i++){
        var frame = $B.frames_stack[i]
        if(search_ids.indexOf(frame[0]) > -1){
            if(frame[1].$is_not_dict){
                // locals is not a dictionary (might be the case with exec(),
                // cf. issue #1597
                try{
                    return $B.$getitem(frame[1], name)
                }catch(err){
                    if(! $B.is_exc(err, [_b_.KeyError])){
                        throw err
                    }
                }
            }else if(frame[1][name] !== undefined){
                return frame[1][name]
            }
        }
        if(search_ids.indexOf(frame[2]) > -1){
            if(frame[3][name] !== undefined){
                return frame[3][name]
            }
        }
    }
    for(var i = 0; i < search_ids.length; i++){
        var search_id = search_ids[i]
        if($B.imported[search_id] && $B.imported[search_id][name]){
            return $B.imported[search_id][name]
        }
    }
    throw $B.name_error(name)
}

$B.$local_search = function(name){
    // search in local namespace
    var frame = $B.last($B.frames_stack)
    if(frame[1][name] !== undefined){return frame[1][name]}
    else{
        throw _b_.UnboundLocalError.$factory("local variable '" +
            name + "' referenced before assignment")
    }
}

$B.get_method_class = function(ns, qualname){
    // Used to set the cell __name__ in a method. ns is the namespace
    // and qualname is the qualified name of the class
    // Generally, for qualname = "A.B", the result is just ns.A.B
    // In some cases, ns.A might not yet be defined (cf. issue #1740).
    // In this case, a fake class is returned with the same qualname.
    var refs = qualname.split('.'),
        klass = ns
    while(refs.length > 0){
        var ref = refs.shift()
        if(klass[ref] === undefined){
            var fake_class = $B.make_class(qualname)
            return fake_class
        }
        klass = klass[ref]
    }
    return klass
}

$B.$check_def = function(name, value){
    // Check if value is not undefined
    if(value !== undefined){
        return value
    }else if(_b_[name] !== undefined){ // issue 1133
        return _b_[name]
    }else{
        var frame = $B.last($B.frames_stack)
        if(frame[1].$is_not_dict){
            // Cf. issue #1597
            try{
                return $B.$getitem(frame[1], name)
            }catch(err){
                if(! $B.is_exc(err, [_b_.KeyError])){
                    throw err
                }
            }
        }else if(frame[1][name] !== undefined){
            return frame[1][name]
        }
        if(frame[3][name] !== undefined){
            return frame[3][name]
        }
    }
    throw $B.name_error(name)
}

$B.$check_def_global = function(name, ns){
    var res = ns[name]
    if(res === undefined){
        throw $B.name_error(name)
    }
    return res
}

$B.$check_def_local = function(name, value){
    // Check if value is not undefined
    if(value !== undefined){return value}
    throw _b_.UnboundLocalError.$factory("local variable '" +
        name + "' referenced before assignment")
}

$B.$check_def_free = function(name, value){
    // Check if value is not undefined
    if(value !== undefined){return value}
    var res
    for(var i = $B.frames_stack.length - 1; i >= 0; i--){
        res = $B.frames_stack[i][1][name]
        if(res !== undefined){return res}
        res = $B.frames_stack[i][3][name]
        if(res !== undefined){return res}
    }
    throw _b_.NameError.$factory("free variable '" + name +
        "' referenced before assignment in enclosing scope")
}

$B.$check_def_free1 = function(name, scope_id){
    // Check if value is not undefined
    var res
    for(var i = $B.frames_stack.length - 1; i >= 0; i--){
        var frame = $B.frames_stack[i]
        res = frame[1][name]
        if(res !== undefined){
            return res
        }
        if(frame[1].$parent){
            res = frame[1].$parent[name]
            if(res !== undefined){return res}
        }
        if(frame[2] == scope_id){
            res = frame[3][name]
            if(res !== undefined){return res}
        }
    }
    throw _b_.NameError.$factory("free variable '" + name +
        "' referenced before assignment in enclosing scope")
}


// transform native JS types into Brython types
$B.$JS2Py = function(src){
    if(typeof src === "number"){
        if(src % 1 === 0){return src}
        return _b_.float.$factory(src)
    }
    if(src === null || src === undefined){return _b_.None}
    if(Array.isArray(src) &&
            Object.getPrototypeOf(src) === Array.prototype){
        src.$brython_class = "js" // used in make_iterator_class
    }
    return src
}

// Functions used if we can guess the type from lexical analysis
$B.list_key = function(obj, key){
    key = $B.$GetInt(key)
    if(key < 0){key += obj.length}
    var res = obj[key]
    if(res === undefined){
        throw _b_.IndexError.$factory("list index out of range")
    }
    return res
}

$B.list_slice = function(obj, start, stop){
    if(start === null){start = 0}
    else{
        start = $B.$GetInt(start)
        if(start < 0){start = Math.max(0, start + obj.length)}
    }
    if(stop === null){return obj.slice(start)}
    stop = $B.$GetInt(stop)
    if(stop < 0){stop += obj.length}
    return obj.slice(start, stop)
}

$B.list_slice_step = function(obj, start, stop, step){
    if(step === null || step == 1){return $B.list_slice(obj, start, stop)}

    if(step == 0){throw _b_.ValueError.$factory("slice step cannot be zero")}
    step = $B.$GetInt(step)

    if(start === null){start = step >= 0 ? 0 : obj.length - 1}
    else{
        start = $B.$GetInt(start)
        if(start < 0){start = Math.min(0, start + obj.length)}
    }
    if(stop === null){stop = step >= 0 ? obj.length : -1}
    else{
        stop = $B.$GetInt(stop)
        if(stop < 0){stop = Math.max(0, stop + obj.length)}
    }

    var res = []
    if(step > 0){
        for(var i = start; i < stop; i += step){res.push(obj[i])}
    }else{
        for(var i = start; i > stop; i += step){res.push(obj[i])}
    }
    return res
}

// get item
function index_error(obj){
    var type = typeof obj == "string" ? "string" : "list"
    throw _b_.IndexError.$factory(type + " index out of range")
}

$B.$getitem = function(obj, item){
    var is_list = Array.isArray(obj) && obj.__class__ === _b_.list,
        is_dict = obj.__class__ === _b_.dict && ! obj.$jsobj
    if(typeof item == "number"){
        if(is_list || typeof obj == "string"){
            item = item >=0 ? item : obj.length + item
            if(obj[item] !== undefined){
                return obj[item]
            }else{
                index_error(obj)
            }
        }else if(is_dict){
            if(obj.$numeric_dict[item] !== undefined){
                return obj.$numeric_dict[item][0]
            }
        }
    }else if(item.valueOf && typeof item.valueOf() == "string" && is_dict){
        var res = obj.$string_dict[item]
        if(res !== undefined){
            return res[0]
        }
        throw _b_.KeyError.$factory(item)
    }

    // PEP 560
    if(obj.$is_class){
        var class_gi = $B.$getattr(obj, "__class_getitem__", _b_.None)
        if(class_gi !== _b_.None){
            return class_gi(item)
        }else if(obj.__class__){
            class_gi = $B.$getattr(obj.__class__, "__getitem__", _b_.None)
            if(class_gi !== _b_.None){
                return class_gi(obj, item)
            }else{
                throw _b_.TypeError.$factory("'" +
                    $B.class_name(obj.__class__) +
                    "' object is not subscriptable")
            }
        }
    }

    if(is_list){
        return _b_.list.$getitem(obj, item)
    }
    if(is_dict){
        return _b_.dict.$getitem(obj, item)
    }

    var gi = $B.$getattr(obj.__class__ || $B.get_class(obj),
        "__getitem__", _b_.None)
    if(gi !== _b_.None){
        return gi(obj, item)
    }

    throw _b_.TypeError.$factory("'" + $B.class_name(obj) +
        "' object is not subscriptable")
}

$B.getitem_slice = function(obj, slice){
    var res
    if(Array.isArray(obj) && obj.__class__ === _b_.list){
        if(slice.start === _b_.None && slice.stop === _b_.None){
            if(slice.step === _b_.None || slice.step == 1){
                res = obj.slice()
            }else if(slice.step == -1){
                res = obj.slice().reverse()
            }
        }else if(slice.step === _b_.None){
            if(slice.start === _b_.None){slice.start = 0}
            if(slice.stop === _b_.None){slice.stop = obj.length}
            if(typeof slice.start == "number" &&
                    typeof slice.stop == "number"){
                if(slice.start < 0){slice.start += obj.length}
                if(slice.stop < 0){slice.stop += obj.length}
                res = obj.slice(slice.start, slice.stop)
            }
        }
        if(res){
            res.__class__ = obj.__class__ // can be tuple
            return res
        }else{
            return _b_.list.$getitem(obj, slice)
        }
    }
    return $B.$getattr(obj, "__getitem__")(slice)
}

// Set list key or slice
$B.set_list_key = function(obj, key, value){
    try{key = $B.$GetInt(key)}
    catch(err){
        if(_b_.isinstance(key, _b_.slice)){
            var s = _b_.slice.$conv_for_seq(key, obj.length)
            return $B.set_list_slice_step(obj, s.start,
                s.stop, s.step, value)
        }
    }
    if(key < 0){key += obj.length}
    if(obj[key] === undefined){
        console.log(obj, key)
        throw _b_.IndexError.$factory("list assignment index out of range")
    }
    obj[key] = value
}

$B.set_list_slice = function(obj, start, stop, value){
    if(start === null){
        start = 0
    }else{
        start = $B.$GetInt(start)
        if(start < 0){start = Math.max(0, start + obj.length)}
    }
    if(stop === null){
        stop = obj.length
    }
    stop = $B.$GetInt(stop)
    if(stop < 0){
        stop = Math.max(0, stop + obj.length)
    }
    var res = _b_.list.$factory(value)
    obj.splice.apply(obj,[start, stop - start].concat(res))
}

$B.set_list_slice_step = function(obj, start, stop, step, value){
    if(step === null || step == 1){
        return $B.set_list_slice(obj, start, stop, value)
    }

    if(step == 0){throw _b_.ValueError.$factory("slice step cannot be zero")}
    step = $B.$GetInt(step)

    if(start === null){
        start = step > 0 ? 0 : obj.length - 1
    }else{
        start = $B.$GetInt(start)
    }

    if(stop === null){
        stop = step > 0 ? obj.length : -1
    }else{
        stop = $B.$GetInt(stop)
    }

    var repl = _b_.list.$factory(value),
        j = 0,
        test,
        nb = 0
    if(step > 0){test = function(i){return i < stop}}
    else{test = function(i){return i > stop}}

    // Test if number of values in the specified slice is equal to the
    // length of the replacement sequence
    for(var i = start; test(i); i += step){nb++}
    if(nb != repl.length){
        throw _b_.ValueError.$factory(
            "attempt to assign sequence of size " + repl.length +
            " to extended slice of size " + nb)
    }

    for(var i = start; test(i); i += step){
        obj[i] = repl[j]
        j++
    }
}

$B.$setitem = function(obj, item, value){
    if(Array.isArray(obj) && obj.__class__ === undefined &&
            typeof item == "number" &&
            !_b_.isinstance(obj, _b_.tuple)){
        if(item < 0){item += obj.length}
        if(obj[item] === undefined){
            throw _b_.IndexError.$factory("list assignment index out of range")
        }
        obj[item] = value
        return
    }else if(obj.__class__ === _b_.dict){
        _b_.dict.$setitem(obj, item, value)
        return
    }else if(obj.__class__ === _b_.list){
        return _b_.list.$setitem(obj, item, value)
    }
    var si = $B.$getattr(obj.__class__ || $B.get_class(obj), "__setitem__",
        null)
    if(si === null){
        throw _b_.TypeError.$factory("'" + $B.class_name(obj) +
            "' object does not support item assignment")
    }
    return si(obj, item, value)
}

// item deletion
$B.$delitem = function(obj, item){
    if(Array.isArray(obj) && obj.__class__ === _b_.list &&
            typeof item == "number" &&
            !_b_.isinstance(obj, _b_.tuple)){
        if(item < 0){item += obj.length}
        if(obj[item] === undefined){
            throw _b_.IndexError.$factory("list deletion index out of range")
        }
        obj.splice(item, 1)
        return
    }else if(obj.__class__ === _b_.dict){
        _b_.dict.__delitem__(obj, item)
        return
    }else if(obj.__class__ === _b_.list){
        return _b_.list.__delitem__(obj, item)
    }
    var di = $B.$getattr(obj.__class__ || $B.get_class(obj), "__delitem__",
        null)
    if(di === null){
        throw _b_.TypeError.$factory("'" + $B.class_name(obj) +
            "' object doesn't support item deletion")
    }
    return di(obj, item)
}

$B.delitem_slice = function(obj, slice){
    if(Array.isArray(obj) && obj.__class__ === _b_.list){
        if(slice.start === _b_.None && slice.stop === _b_.None){
            if(slice.step === _b_.None || slice.step == 1 ||
                    slice.step == -1){
                while(obj.length > 0){
                    obj.pop()
                }
                return _b_.None
            }
        }else if(slice.step === _b_.None){
            if(slice.start === _b_.None){
                slice.start = 0
            }
            if(slice.stop === _b_.None){
                slice.stop = obj.length
            }
            if(typeof slice.start == "number" &&
                    typeof slice.stop == "number"){
                if(slice.start < 0){
                    slice.start += obj.length
                }
                if(slice.stop < 0){
                    slice.stop += obj.length
                }
                obj.splice(slice.start, slice.stop - slice.start)
                return _b_.None
            }
        }
    }
    var di = $B.$getattr(obj.__class__ || $B.get_class(obj), "__delitem__",
        null)

    if(di === null){
        throw _b_.TypeError.$factory("'" + $B.class_name(obj) +
            "' object doesn't support item deletion")
    }
    return di(obj, slice)
}

$B.augm_assign = function(left, op, right){
    // augmented assignment
    var op1 = op.substr(0, op.length - 1)
    if(typeof left == 'number' && typeof right == 'number'
            && op != '//='){ // operator "//" not supported by Javascript
        var res = eval(left + ' ' + op1 + ' ' + right)
        if(res <= $B.max_int && res >= $B.min_int &&
                res.toString().search(/e/i) == -1){
            return res
        }else{
            res = eval(`${BigInt(left)}n ${op1} ${BigInt(right)}n`)
            var pos = res > 0n,
                res = res + ''
            return pos ? $B.fast_long_int(res, true) :
                         $B.fast_long_int(res.substr(1), false) // remove "-"
        }
    }else if(typeof left == 'string' && typeof right == 'string' &&
            op == '+='){
        return left + right
    }else{
        var method = $B.op2method.augmented_assigns[op],
            augm_func = $B.$getattr(left, '__' + method + '__', null)
        if(augm_func !== null){
            return $B.$call(augm_func)(right)
        }else{
            var method1 = $B.op2method.operations[op1]
            if(method1 === undefined){
                method1 = $B.op2method.binary[op1]
            }
            return $B.rich_op(`__${method1}__`, left, right)
        }
    }
}

$B.extend = function(fname, arg){
    // Called if a function call has **kw arguments
    // arg is a dictionary with the keyword arguments entered with the
    // syntax key = value
    // The next arguments of $B.extend are the mappings to unpack
    for(var i = 2; i < arguments.length; i++){
        var mapping = arguments[i]
        var it = _b_.iter(mapping),
            getter = $B.$getattr(mapping, "__getitem__")
        while (true){
            try{
                var key = _b_.next(it)
                if(typeof key !== "string"){
                    throw _b_.TypeError.$factory(fname +
                        "() keywords must be strings")
                }
                if(arg[key] !== undefined){
                    throw _b_.TypeError.$factory(fname +
                        "() got multiple values for argument '" + key + "'")
                }
                arg[key] = getter(key)
            }catch(err){
                if(_b_.isinstance(err, [_b_.StopIteration])){
                    break
                }
                throw err
            }
        }
    }
    return arg
}

// function used if a function call has an argument *args
$B.extend_list = function(){
    // The last argument is the iterable to unpack
    var res = Array.prototype.slice.call(arguments, 0, arguments.length - 1),
        last = $B.last(arguments)
    var it = _b_.iter(last)
    while (true){
        try{
            res.push(_b_.next(it))
        }catch(err){
            if(_b_.isinstance(err, [_b_.StopIteration])){
                break
            }
            throw err
        }
    }
    return res
}

$B.$test_item = function(expr){
    // used to evaluate expressions with "and" or "or"
    // returns a Javascript boolean (true or false) and stores
    // the evaluation in a global variable $test_result
    $B.$test_result = expr
    return _b_.bool.$factory(expr)
}

$B.$test_expr = function(){
    // returns the last evaluated item
    return $B.$test_result
}

$B.$is = function(a, b){
    // Used for Python "is". In most cases it's the same as Javascript ===,
    // but new Number(1) === new Number(1) is false, and so is
    // new Number(1) == new Number(1) !!!
    // Cf. issue 669
    if(a instanceof Number && b instanceof Number){
        return a.valueOf() == b.valueOf()
    }
    if((a === _b_.int && b == $B.long_int) ||
            (a === $B.long_int && b === _b_.int)){
        return true
    }
    return a === b
}

$B.conv_undef = function(obj){
    // Used inside functions to convert Javascript undefined to $B.Undefined
    // defined in builtin_modules.js
    var res = {}
    for(var key in obj){
        res[key] = obj[key] === undefined ? $B.Undefined : obj[key]
    }
    return res
}

$B.$is_member = function(item, _set){
    // used for "item in _set"
    var f, _iter, method

    // Use __contains__ if defined *on the class* (implicit invocation of
    // special methods don't use object __dict__)
    try{
        method = $B.$getattr(_set.__class__ || $B.get_class(_set),
            "__contains__")

    }
    catch(err){}

    if(method){
        return $B.$call(method)(_set, item)
    }

    // use __iter__ if defined
    try{_iter = _b_.iter(_set)}
    catch(err){}
    if(_iter){
        while(1){
            try{
                var elt = _b_.next(_iter)
                if($B.rich_comp("__eq__", elt, item)){return true}
            }catch(err){
                return false
            }
        }
    }

    // use __getitem__ if defined
    try{f = $B.$getattr(_set, "__getitem__")}
    catch(err){
        throw _b_.TypeError.$factory("'" + $B.class_name(_set) +
            "' object is not iterable")
    }
    if(f){
        var i = -1
        while(1){
            i++
            try{
                var elt = f(i)
                if($B.rich_comp("__eq__", elt, item)){return true}
            }catch(err){
                if(err.__class__ === _b_.IndexError){return false}
                throw err
            }
        }
    }
}

$B.$call = function(callable){
    if(callable.__class__ === $B.method){
        return callable
    }else if(callable.$factory){
        return callable.$factory
    }else if(callable.$is_class){
        // Use metaclass __call__, cache result in callable.$factory
        return callable.$factory = $B.$instance_creator(callable)
    }else if(callable.$is_js_class){
        // JS class uses "new"
        return callable.$factory = function(){
            return new callable(...arguments)
        }
    }else if(callable.$in_js_module){
        // attribute $in_js_module is set for functions in modules written
        // in Javascript, in py_import.js
        return function(){
            var res = callable(...arguments)
            return res === undefined ? _b_.None : res
        }
    }else if(callable.$is_func || typeof callable == "function"){
        return callable
    }
    try{
        return $B.$getattr(callable, "__call__")
    }catch(err){
        throw _b_.TypeError.$factory("'" + $B.class_name(callable) +
            "' object is not callable")
    }
}

// Default standard output and error
// Can be reset by sys.stdout or sys.stderr
var $io = $B.make_class("io",
    function(out){
        return {
            __class__: $io,
            out
        }
    }
)

$io.flush = function(self){
    console[self.out].apply(null, self.buf)
    self.buf = []
}

$io.write = function(self, msg){
    // Default to printing to browser console
    if(self.buf === undefined){
        self.buf = []
    }
    if(typeof msg != "string"){
        throw _b_.TypeError.$factory("write() argument must be str, not " +
            $B.class_name(msg))
    }
    self.buf.push(msg)
    return _b_.None
}

if(console.error !== undefined){
    $B.stderr = $io.$factory("error")
}else{
    $B.stderr = $io.$factory("log")
}
$B.stdout = $io.$factory("log")

$B.stdin = {
    __class__: $io,
    __original__: true,
    closed: false,
    len: 1,
    pos: 0,
    read: function (){
        return ""
    },
    readline: function(){
        return ""
    }
}

$B.make_iterator_class = function(name){
    // Builds a class to iterate over items

    var klass = {
        __class__: _b_.type,
        __mro__: [_b_.object],
        $factory: function(items){
            return {
                __class__: klass,
                __dict__: $B.empty_dict(),
                counter: -1,
                items: items,
                len: items.length
            }
        },
        $infos:{
            __name__: name
        },
        $is_class: true,

        __iter__: function(self){
            self.counter = self.counter === undefined ? -1 : self.counter
            self.len = self.items.length
            return self
        },

        __len__: function(self){
            return self.items.length
        },

        __next__: function(self){
            if(typeof self.test_change == "function" && self.test_change()){
                // Used in dictionaries : test if the current dictionary
                // attribute "$version" is the same as when the iterator was
                // created. If not, items have been added to or removed from
                // the dictionary
                throw _b_.RuntimeError.$factory(
                    "dictionary changed size during iteration")
            }

            self.counter++
            if(self.counter < self.items.length){
                var item = self.items[self.counter]
                if(self.items.$brython_class == "js"){
                    // iteration on Javascript lists produces Python objects
                    // cf. issue #1388
                    item = $B.$JS2Py(item)
                }
                return item
            }
            throw _b_.StopIteration.$factory("StopIteration")
        },

        __reduce_ex__: function(self, protocol){
            return $B.fast_tuple([_b_.iter, _b_.tuple.$factory([self.items])])
        }
    }

    $B.set_func_names(klass, "builtins")
    return klass
}

function $err(op, klass, other){
    var msg = "unsupported operand type(s) for " + op + " : '" +
        klass.$infos.__name__ + "' and '" + $B.class_name(other) + "'"
    throw _b_.TypeError.$factory(msg)
}

// Code to add support of "reflected" methods to built-in types
// If a type doesn't support __add__, try method __radd__ of operand

var r_opnames = ["add", "sub", "mul", "truediv", "floordiv", "mod", "pow",
    "lshift", "rshift", "and", "xor", "or"]
var ropsigns = ["+", "-", "*", "/", "//", "%", "**", "<<", ">>", "&", "^",
     "|"]

$B.make_rmethods = function(klass){
    for(var r_opname of r_opnames){
        if(klass["__r" + r_opname + "__"] === undefined &&
                klass['__' + r_opname + '__']){
            klass["__r" + r_opname + "__"] = (function(name){
                return function(self, other){
                    return klass["__" + name + "__"](other, self)
                }
            })(r_opname)
        }
    }
}

// UUID is a function to produce a unique id.
// the variable $B.py_UUID is defined in py2js.js (in the brython function)
$B.UUID = function(){return $B.$py_UUID++}

$B.$GetInt = function(value) {
  // convert value to an integer
  if(typeof value == "number" || value.constructor === Number){return value}
  else if(typeof value === "boolean"){return value ? 1 : 0}
  else if(_b_.isinstance(value, _b_.int)){return value}
  else if(_b_.isinstance(value, _b_.float)){return value.valueOf()}
  if(! value.$is_class){
      try{var v = $B.$getattr(value, "__int__")(); return v}catch(e){}
      try{var v = $B.$getattr(value, "__index__")(); return v}catch(e){}
  }
  throw _b_.TypeError.$factory("'" + $B.class_name(value) +
      "' object cannot be interpreted as an integer")
}


$B.to_num = function(obj, methods){
    // If object's class defines one of the methods, return the result
    // of method(obj), else return null
    var expected_class = {
        "__complex__": _b_.complex,
        "__float__": _b_.float,
        "__index__": _b_.int,
        "__int__": _b_.int
    }
    var klass = obj.__class__ || $B.get_class(obj)
    for(var i = 0; i < methods.length; i++) {
        var missing = {},
            method = $B.$getattr(klass, methods[i], missing)
        if(method !== missing){
            var res = method(obj)
            if(!_b_.isinstance(res, expected_class[methods[i]])){
                console.log(res, methods[i], expected_class[methods[i]])
                throw _b_.TypeError.$factory(methods[i] + "returned non-" +
                    expected_class[methods[i]].$infos.__name__ +
                    "(type " + $B.get_class(res) +")")
            }
            return res
        }
    }
    return null
}


$B.PyNumber_Index = function(item){
    switch(typeof item){
        case "boolean":
            return item ? 1 : 0
        case "number":
            return item
        case "object":
            if(item.__class__ === $B.long_int){
                return item
            }
            if(_b_.isinstance(item, _b_.int)){
                // int subclass
                return item.$brython_value
            }
            var method = $B.$getattr(item, "__index__", _b_.None)
            if(method !== _b_.None){
                method = typeof method == "function" ?
                            method : $B.$getattr(method, "__call__")
                return $B.int_or_bool(method())
            }else{
                throw _b_.TypeError.$factory("'" + $B.class_name(item) +
                    "' object cannot be interpreted as an integer")
            }
        default:
            throw _b_.TypeError.$factory("'" + $B.class_name(item) +
                "' object cannot be interpreted as an integer")
    }
}

$B.int_or_bool = function(v){
    switch(typeof v){
        case "boolean":
            return v ? 1 : 0
        case "number":
            return v
        case "object":
            if(v.__class__ === $B.long_int){return v}
            else{
                throw _b_.TypeError.$factory("'" + $B.class_name(v) +
                "' object cannot be interpreted as an integer")
            }
        default:
            throw _b_.TypeError.$factory("'" + $B.class_name(v) +
                "' object cannot be interpreted as an integer")
    }
}

$B.enter_frame = function(frame){
    // Enter execution frame : save on top of frames stack
    $B.frames_stack.push(frame)
    if($B.tracefunc && $B.tracefunc !== _b_.None){
        if(frame[4] === $B.tracefunc ||
                ($B.tracefunc.$infos && frame[4] &&
                 frame[4] === $B.tracefunc.$infos.__func__)){
            // to avoid recursion, don't run the trace function inside itself
            $B.tracefunc.$frame_id = frame[0]
            return _b_.None
        }else{
            // also to avoid recursion, don't run the trace function in the
            // frame "below" it (ie in functions that the trace function
            // calls)
            for(var i = $B.frames_stack.length - 1; i >= 0; i--){
                if($B.frames_stack[i][0] == $B.tracefunc.$frame_id){
                    return _b_.None
                }
            }
            try{
                return $B.tracefunc($B._frame.$factory($B.frames_stack,
                    $B.frames_stack.length - 1), 'call', _b_.None)
            }catch(err){
                err.$in_trace_func = true
                throw err
            }
        }
    }
    return _b_.None
}

$B.trace_exception = function(){
    var top_frame = $B.last($B.frames_stack)
    if(top_frame[0] == $B.tracefunc.$current_frame_id){
        return _b_.None
    }
    var trace_func = top_frame[1].$f_trace,
        exc = top_frame[1].$current_exception,
        frame_obj = $B._frame.$factory($B.frames_stack,
            $B.frames_stack.length - 1)
    return trace_func(frame_obj, 'exception', $B.fast_tuple([
        exc.__class__, exc, $B.traceback.$factory(exc)]))
}

$B.trace_line = function(){
    var top_frame = $B.last($B.frames_stack)
    if(top_frame[0] == $B.tracefunc.$current_frame_id){
        return _b_.None
    }
    var trace_func = top_frame[1].$f_trace,
        frame_obj = $B._frame.$factory($B.frames_stack,
            $B.frames_stack.length - 1)
    return trace_func(frame_obj, 'line', _b_.None)
}

$B.set_line = function(line_info){
    // Used in loops to run trace function
    var top_frame = $B.last($B.frames_stack)
    if($B.tracefunc && top_frame[0] == $B.tracefunc.$current_frame_id){
        return _b_.None
    }
    top_frame[1].$line_info = line_info
    var trace_func = top_frame[1].$f_trace
    if(trace_func !== _b_.None){
        var frame_obj = $B._frame.$factory($B.frames_stack,
            $B.frames_stack.length - 1)
        top_frame[1].$ftrace = trace_func(frame_obj, 'line', _b_.None)
    }
    return true
}

$B.trace_return = function(value){
    var top_frame = $B.last($B.frames_stack),
        trace_func = top_frame[1].$f_trace,
        frame_obj = $B._frame.$factory($B.frames_stack,
            $B.frames_stack.length - 1)
    if(top_frame[0] == $B.tracefunc.$current_frame_id){
        // don't call trace func when returning from the frame where
        // sys.settrace was called
        return _b_.None
    }
    trace_func(frame_obj, 'return', value)
}

$B.leave_frame = function(arg){
    // Leave execution frame
    if($B.frames_stack.length == 0){console.log("empty stack"); return}

    // When leaving a module, arg is set as an object of the form
    // {$locals, value: _b_.None}
    if(arg && arg.value !== undefined && $B.tracefunc){
        if($B.last($B.frames_stack)[1].$f_trace === undefined){
            $B.last($B.frames_stack)[1].$f_trace = $B.tracefunc
        }
        if($B.last($B.frames_stack)[1].$f_trace !== _b_.None){
            $B.trace_return(arg.value)
        }
    }
    var frame = $B.frames_stack.pop()
    if(frame[1].$is_generator){
        // Get context managers in a generator
        var ctx_managers = new Set()
        for(var key in frame[1]){
            if(key.startsWith('$ctx_manager')){
                ctx_managers.add(frame[1][key])
            }
        }
        if(ctx_managers.size > 0 && $B.frames_stack.length > 0){
            // store context managers in previous frame
            var caller = $B.last($B.frames_stack)
            caller[1].$ctx_managers_in_gen = caller[1].$ctx_managers_in_gen ||
                new Set()
            for(var cm of ctx_managers){
                caller[1].$ctx_managers_in_gen.add(cm)
            }
        }
    }
    frame[1].$current_exception = undefined
    if(frame[1].$ctx_managers_in_gen){
        for(var cm of frame[1].$ctx_managers_in_gen){
            $B.$call($B.$getattr(cm, '__exit__'))(_b_.None, _b_.None, _b_.None)
        }
    }
    return _b_.None
}

$B.leave_frame_exec = function(arg){
    // Leave execution frame in an "exec" or "eval" : may have side effects
    // on the englobing namespace
    if($B.profile > 0){$B.$profile.return()}
    if($B.frames_stack.length == 0){console.log("empty stack"); return}
    var frame = $B.last($B.frames_stack)
    $B.frames_stack.pop()
    if(frame[1].$ctx_managers_in_gen){
        // If the frame used generators with context managers, exit them.
        // Simulates garbage collection.
        for(var cm of frame[1].$ctx_managers_in_gen){
            $B.$call($B.$getattr(cm, '__exit__'))(_b_.None, _b_.None, _b_.None)
        }
    }

    for(var i = $B.frames_stack.length - 1; i >= 0; i--){
        if($B.frames_stack[i][2] == frame[2]){
            $B.frames_stack[i][3] = frame[3]
        }
    }
}

var min_int = Math.pow(-2, 53), max_int = Math.pow(2, 53) - 1

$B.is_safe_int = function(){
    for(var i = 0; i < arguments.length; i++){
        var arg = arguments[i]
        if((typeof arg != "number") ||
                (arg < min_int || arg > max_int)){
            return false
        }
    }
    return true
}

$B.add = function(x, y){
    if(x.valueOf && typeof x.valueOf() == "number" &&
            y.valueOf && typeof y.valueOf() == "number"){
        if(typeof x == "number" && typeof y == "number"){
            // ints
            var z = x + y
            if(z < $B.max_int && z > $B.min_int){
                return z
            }else if(z === Infinity){
                return _b_.float.$factory("inf")
            }else if(z === -Infinity){
                return _b_.float.$factory("-inf")
            }else if(isNaN(z)){
                return _b_.float.$factory('nan')
            }
            return $B.long_int.__add__($B.long_int.$factory(x),
                $B.long_int.$factory(y))
        }else{
            // floats
            return new Number(x + y)
        }
    }else if (typeof x == "string" && typeof y == "string"){
        // strings
        return x + y
    }
    try{
        var method = $B.$getattr(x.__class__ || $B.get_class(x), "__add__")
    }catch(err){
        if(err.__class__ === _b_.AttributeError){
            throw _b_.TypeError.$factory("unsupported operand type(s) for " +
                "+: '" + $B.class_name(x) +"' and '" + $B.class_name(y) + "'")
        }
        throw err
    }
    var res = $B.$call(method)(x, y)
    if(res === _b_.NotImplemented){ // issue 1309
        return $B.rich_op("__add__", x, y)
    }
    return res
}

$B.div = function(x, y){
    var z = x / y
    if(x > min_int && x < max_int && y > min_int && y < max_int
        && z > min_int && z < max_int){return z}
    else{
        return $B.long_int.__truediv__($B.long_int.$factory(x),
            $B.long_int.$factory(y))
    }
}

$B.eq = function(x, y){
    if(x > min_int && x < max_int && y > min_int && y < max_int){return x == y}
    return $B.long_int.__eq__($B.long_int.$factory(x), $B.long_int.$factory(y))
}

$B.floordiv = function(x, y){
    var z = x / y
    if(x > min_int && x < max_int && y > min_int && y < max_int
        && z > min_int && z < max_int){return Math.floor(z)}
    else{
        return $B.long_int.__floordiv__($B.long_int.$factory(x),
            $B.long_int.$factory(y))
    }
}

$B.mul = function(x, y){
    var z = (typeof x != "number" || typeof y != "number") ?
            new Number(x * y) : x * y
    if(x > min_int && x < max_int && y > min_int && y < max_int
        && z > min_int && z < max_int){return z}
    else if((typeof x == "number" || x.__class__ === $B.long_int)
            && (typeof y == "number" || y.__class__ === $B.long_int)){
        if((typeof x == "number" && isNaN(x)) ||
                (typeof y == "number" && isNaN(y))){
            return _b_.float.$factory("nan")
        }
        switch(x){
            case Infinity:
            case -Infinity:
                if(y == 0){
                    return _b_.float.$factory("nan")
                }else{
                    return y > 0 ? x : -x
                }
        }
        return $B.long_int.__mul__($B.long_int.$factory(x),
            $B.long_int.$factory(y))
    }else{return z}
}

$B.sub = function(x, y){
    if(x instanceof Number && y instanceof Number){
        return x - y
    }
    var z = (typeof x != "number" || typeof y != "number") ?
                new Number(x - y) : x - y
    if(x > min_int && x < max_int && y > min_int && y < max_int
            && z > min_int && z < max_int){
        return z
    }else if((typeof x == "number" || x.__class__  === $B.long_int)
            && (typeof y == "number" || y.__class__ === $B.long_int)){
        if(typeof x == "number" && typeof y == "number"){
            if(isNaN(x) || isNaN(y)){
                return _b_.float.$factory("nan")
            }else if(x === Infinity || x === -Infinity){
                if(y === x){
                    return _b_.float.$factory("nan")
                }else{
                    return x
                }
            }else if(y === Infinity || y === -Infinity){
                if(y === x){
                    return _b_.float.$factory("nan")
                }else{
                    return -y
                }
            }
        }
        if((typeof x == "number" && isNaN(x)) ||
                (typeof y == "number" && isNaN(y))){
            return _b_.float.$factory("nan")
        }
        return $B.long_int.__sub__($B.long_int.$factory(x),
            $B.long_int.$factory(y))
    }else{
        return z
    }
}

// greater or equal
$B.ge = function(x, y){
    if(typeof x == "number" && typeof y == "number"){return x >= y}
    // a safe int is >= to a long int if the long int is negative
    else if(typeof x == "number" && typeof y != "number"){return ! y.pos}
    else if(typeof x != "number" && typeof y == "number"){
        return x.pos === true
    }else{return $B.long_int.__ge__(x, y)}
}
$B.gt = function(x, y){
    if(typeof x == "number" && typeof y == "number"){return x > y}
    // a safe int is >= to a long int if the long int is negative
    else if(typeof x == "number" && typeof y != "number"){return ! y.pos}
    else if(typeof x != "number" && typeof y == "number"){
        return x.pos === true
    }else{return $B.long_int.__gt__(x, y)}
}

var reversed_op = {"__lt__": "__gt__", "__le__":"__ge__",
    "__gt__": "__lt__", "__ge__": "__le__"}
var method2comp = {"__lt__": "<", "__le__": "<=", "__gt__": ">",
    "__ge__": ">="}

$B.rich_comp = function(op, x, y){
    if(x === undefined){
        throw _b_.RuntimeError.$factory('error in rich comp')
    }
    var x1 = x.valueOf ? x.valueOf() : x,
        y1 = y.valueOf ? y.valueOf() : y
    if(typeof x1 == "number" && typeof y1 == "number" &&
            x.__class__ === undefined && y.__class__ === undefined){
        switch(op){
            case "__eq__":
                return x1 == y1
            case "__ne__":
                return x1 != y1
            case "__le__":
                return x1 <= y1
            case "__lt__":
                return x1 < y1
            case "__ge__":
                return x1 >= y1
            case "__gt__":
                return x1 > y1
        }
    }
    var res

    if(x.$is_class || x.$factory) {
        if(op == "__eq__"){
            return (x === y)
        }else if(op == "__ne__"){
            return !(x === y)
        }else{
            throw _b_.TypeError.$factory("'" + method2comp[op] +
                "' not supported between instances of '" + $B.class_name(x) +
                "' and '" + $B.class_name(y) + "'")
        }
    }

    var x_class_op = $B.$call($B.$getattr(x.__class__ || $B.get_class(x), op)),
        rev_op = reversed_op[op] || op
    if(x.__class__ && y.__class__){
        // cf issue #600 and
        // https://docs.python.org/3/reference/datamodel.html :
        // "If the operands are of different types, and right operand’s type
        // is a direct or indirect subclass of the left operand’s type, the
        // reflected method of the right operand has priority, otherwise the
        // left operand’s method has priority."
        if(y.__class__.__mro__.indexOf(x.__class__) > -1){
            var rev_func = $B.$getattr(y, rev_op)
            res = $B.$call($B.$getattr(y, rev_op))(x)
            if(res !== _b_.NotImplemented){
                return res
            }
        }
    }

    res = x_class_op(x, y)
    if(res !== _b_.NotImplemented){
        return res
    }
    var y_class_op = $B.$call($B.$getattr(y.__class__ || $B.get_class(y),
        rev_op))
    res = y_class_op(y, x)
    if(res !== _b_.NotImplemented ){
        return res
    }

    // If both operands return NotImplemented, return False if the operand is
    // __eq__, True if it is __ne__, raise TypeError otherwise
    if(op == "__eq__"){
        return _b_.False
    }else if(op == "__ne__"){
        return _b_.True
    }

    throw _b_.TypeError.$factory("'" + method2comp[op] +
        "' not supported between instances of '" + $B.class_name(x) +
        "' and '" + $B.class_name(y) + "'")
}

var opname2opsign = {__sub__: "-", __xor__: "^", __mul__: "*"}

$B.rich_op = function(op, x, y){
    var x_class = x.__class__ || $B.get_class(x),
        y_class = y.__class__ || $B.get_class(y),
        rop = '__r' + op.substr(2),
        method
    if(x_class === y_class){
        // For objects of the same type, don't try the reversed operator
        if(x_class === _b_.int){
            return _b_.int[op](x, y)
        }else if(x_class === _b_.bool){
            return (_b_.bool[op] || _b_.int[op])
                (x, y)
        }
        try{
            method = $B.$call($B.$getattr(x_class, op))
        }catch(err){
            if(err.__class__ === _b_.AttributeError){
                var kl_name = $B.class_name(x)
                throw _b_.TypeError.$factory("unsupported operand type(s) " +
                    "for " + opname2opsign[op] + " : '" + kl_name + "' and '" +
                    kl_name + "'")
            }
            throw err
        }
        return method(x, y)
    }

    if(_b_.issubclass(y_class, x_class)){
        // issue #1686
        var reflected_left = $B.$getattr(x_class, rop),
            reflected_right = $B.$getattr(y_class, rop)
        if(reflected_right !== reflected_left){
            return reflected_right(y, x)
        }
    }
    // For instances of different classes, try reversed operator
    var res
    try{
        method = $B.$call($B.$getattr(x, op))
    }catch(err){
        if(err.__class__ !== _b_.AttributeError){
            throw err
        }
        res = $B.$call($B.$getattr(y, rop))(x)
        if(res !== _b_.NotImplemented){
            return res
        }
        throw _b_.TypeError.$factory("'" + (opname2opsign[op] || op) +
            "' not supported between instances of '" + $B.class_name(x) +
            "' and '" + $B.class_name(y) + "'")
    }
    res = method(y)
    if(res === _b_.NotImplemented){
        var reflected = $B.$getattr(y, rop, null)
        if(reflected !== null){
            res = $B.$call(reflected)(x)
            if(res !== _b_.NotImplemented){
                return res
            }
        }
        throw _b_.TypeError.$factory("'" + (opname2opsign[op] || op) +
            "' not supported between instances of '" + $B.class_name(x) +
            "' and '" + $B.class_name(y) + "'")
    }else{
        return res
    }
}

$B.is_none = function(o){
    return o === undefined || o === null || o == _b_.None
}

// used to detect recursion in repr() / str() of lists and dicts
var repr_stack = new Set()

$B.repr = {
    enter: function(obj){
        if(repr_stack.has(obj)){
            return true
        }else{
            repr_stack.add(obj)
        }
    },
    leave: function(obj){
        repr_stack.delete(obj)
    }
}

})(__BRYTHON__)
