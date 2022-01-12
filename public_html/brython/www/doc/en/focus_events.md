Focus events
============

Focus events are

<table cellpadding=3 border=1>
<tr>
<td>*blur*</td>
<td>an element has lost focus
</td>
</tr>

<tr>
<td>*focus*</td><td>an element has received focus</td>
</tr>

</table>

#### Example

Click in the entry field below to make it receive focus, then click somewhere
outside the field to make it lose focus.

<p><input id="entry" autocomplete="off">&nbsp;
<span id="traceFocus">&nbsp;</span>

#### Code

```exec_on_load
from browser import bind, document

@bind("#entry", "focus")
def focus(ev):
    document["traceFocus"].text = f"{ev.target.id} receives focus"

@bind("#entry", "blur")
def blur(ev):
    document["traceFocus"].text = f"{ev.target.id} loses focus"
```
