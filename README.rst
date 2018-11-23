HDXTOOLS ANGULAR LIBRARY
========================

INFO
----
The library was created using the Angular CLI generate command.
Eg. `ng generate library hxl-preview-ng-lib --prefix=hxl`

BUILDING THE LIBRARY
--------------------
To build and package the library simply run :code:`npm run package`. This will also move the generated package to
the `build` folder.

To test just building you can run `npm run build_lib`

USING WITHOUT PUBLISHING
------------------------

Then, to use it in a project: :code:`npm install hdx-ng-library/dist/hxl-preview-ng-lib-0.0.1.tgz`

Alternatively, you can put in the `package.json <package.json>`_ something like :code:`"hxl-preview-ng-lib": "file:/srv/hxlpreview/hxl-preview-ng-library/dist/hxl-preview-ng-lib-0.2.2.tgz"` in the *dependencies* section and then just run :code:`npm install`


More information about using a library `without publishing on npm server <http://podefr.tumblr.com/post/30488475488/locally-test-your-npm-modules-without-publishing>`_


**NOTE**: For now the library is not published on npm but is part of this repo in `build <build>`_
