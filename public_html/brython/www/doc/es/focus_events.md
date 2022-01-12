Eventos de foco
===============


Los eventos de foco son

<table cellpadding=3 border=1>
<tr>
<td>*blur*</td>
<td>un elemento ha perdido el foco
</td>
</tr>

<tr>
<td>*focus*</td><td>un elemento ha recibido el foco</td>
</tr>

</table>

#### Ejemplo

Pulsa en el campo de entrada de abajo para hacer que reciba el foco,
posteriormente pulsa en cualquier otro sitio para hacer que pierda el foco.

<p><input id="entry" autocomplete="off">&nbsp;
<span id="traceFocus">&nbsp;</span>

#### Código

```exec_on_load
from browser import bind, document

@bind("#entry", "focus")
def focus(ev):
    document["traceFocus"].text = f"{ev.target.id} recibe el foco"

@bind("#entry", "blur")
def blur(ev):
    document["traceFocus"].text = f"{ev.target.id} pierde el foco"
```
