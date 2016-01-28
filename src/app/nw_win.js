var gulp = require('gulp');
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


/* Livereload app during development */
gulp.task('reload', function () {
    if (location) location.reload();
});

gulp.watch('**/*', ['reload']);
