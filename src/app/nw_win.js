var gulp = require('gulp');
var gui = require('nw.gui');
var AutoLaunch = require('auto-launch');

/* Auto launch packaged app on startup */
var appLauncher = new AutoLaunch({
    name: 'GoldFish'
});

appLauncher.isEnabled(function(enabled){
    if(enabled) return;
    appLauncher.enable(function(err){
        // log error somewhere?
    });
});

/* Get window instance, and show */
var win = gui.Window.get();
win.show();

/* Livereload app during development */
gulp.task('reload', function () {
    if (location) location.reload();
});

gulp.watch('**/*', ['reload']);
