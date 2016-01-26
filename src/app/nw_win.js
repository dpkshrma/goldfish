var gulp = require('gulp');
var gui = require('nw.gui');

var win = gui.Window.get();

gulp.task('reload', function () {
    if (location) location.reload();
});

gulp.watch('**/*', ['reload']);

win.show();
