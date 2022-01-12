Sans installation
-----------------
On peut utiliser Brython sans avoir à installer quoi que ce soit, il suffit
d'inclure les scripts Brython dans la page HTML depuis un CDN.

```xml
<script src="https://cdn.jsdelivr.net/npm/brython@3/brython.min.js">
</script>
<script src="https://cdn.jsdelivr.net/npm/brython@3/brython_stdlib.js">
</script>
```

On peut aussi préciser la version mineure avec `brython@3.10` et la version
micro avec `brython@3.10.4`.

Brython est également disponible sur cdnjs:

```xml
<script src="https://cdnjs.cloudflare.com/ajax/libs/brython/3.10.4/brython.min.js">
</script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/brython/3.10.4/brython_stdlib.min.js">
</script>
```

Installation locale
-------------------

Pour installer Brython localement:

- si votre PC peut utiliser CPython et pip, installez le package `brython` par
```console
pip install brython
```

Le package installe un logiciel client `brython-cli` (équivalent à `python -m brython`).

> puis dans un répertoire vide, exécutez
>```console
>brython-cli --install
>```

- si vous ne pouvez pas utiliser cette méthode, aller sur la [page des publications]
(https://github.com/brython-dev/brython/releases) sur Github, sélectionnez la
 dernière version, téléchargez et dézippez le fichier __Brython-x.y.z.zip__.

Dans les deux cas vous disposez des fichiers suivants :

- __brython.js__ : le moteur Brython, à inclure dans la page HTML
- __brython_stdlib.js__ : regroupe tous les fichiers de la distribution Python
  standard supportés par Brython
- __demo.html__ : une page qui donne quelques exemples d'utilisation de Brython

__brython.js__ contient quelques modules très utilisés : `browser, browser.html, `
`javascript`.

Si votre application utilise des modules de la distribution standard, il faut
inclure __brython_stdlib.js__ en plus de __brython.js__:

```xml
<script type="text/javascript" src="brython.js"></script>
<script type="text/javascript" src="brython_stdlib.js"></script>
```

Mises à jour
------------
Quand une nouvelle version de Brython est publiée, la mise à jour s'effectue
par la commande habituelle:

```console
pip install brython --upgrade
```

Dans le répertoire de l'application, vous pouvez ensuite mettre à jour les
fichiers Brython (__brython.js__ et __brython_stdlib.js__) par:

```console
brython-cli --update
```

Installer un package CPython
----------------------------
Un package CPython installé par `pip` peut être installé dans une application
Brython par la commande `--add_package <nom du package>`.

Par exemple:
```console
pip install attrs
brython-cli --add_package attrs
```

Pour cela il faut naturellement que tous les fichiers du package soient
exécutables par Brython ; cela exclut les fichiers écrits en langage C par
exemple.

Autres commandes
----------------

`-- modules`

> crée une distribution propre à l'application, pour remplacer
> __`brython_stdlib.js`__ par un fichier moins volumineux. Voir la section
> [import](import.html)

`-- make_dist`

> génère un package CPython, distribuable par PyPI, pour installer une
> application Brython. Voir la section [Déployer une application](deploy.html)

`-- make_package`

> génère un "package Brython" permettant de distribuer très simplement un
> module ou un package. Voir la section [Packages Brython](brython-packages.html)

`-- version`

> affiche la version de Brython

Serveur web
-----------
Les fichiers HTML peuvent être ouverts directement dans le navigateur, mais il
est préférable de lancer un serveur web dans le répertoire de l'application.

Pour cela vous pouvez utiliser le module **http.server** de la distribution
standard:

```console
python -m http.server
```

Par défaut le port utilisé est 8000. Pour choisir un autre port:

```console
python -m http.server 8001
```

Vous pouvez alors accéder aux pages en entrant _http://localhost:8001/demo.html_
dans la barre d'adresse du navigateur.