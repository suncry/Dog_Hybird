/**
 * yexiaochai 待续
 */
module.exports = function (grunt) {

    grunt.initConfig({

        pkg: grunt.file.readJSON('package.json'),

        //移动html与样式文件
        "copy": {
            'template': {
                "files": [{
                    "expand": true,
                    "cwd": "<%= config.srcDir%>/",
                    "src": ["**/*.html"],
                    "dest": "<%= config.destDir %>"
                }]
            },
            'project': {
                "files": [{
                    "expand": true,
                    "cwd": "<%= config.srcDir%>/",
                    "src": ["static/**"],
                    "dest": "<%= config.destDir %>"
                }]
            },

            'static': {
                "files": [{
                    "expand": true,
                    "cwd": "<%= config.srcDir%>/",
                    "src": ["**"],
                    "dest": "<%= config.destDir %>"
                }]
            }
        },

        "htmlmin": {
            "web": {
                options: {
                    removeComments: true,
                    collapseWhitespace: true
                },
                "files": [{
                    "expand": true,
                    "cwd": "<%= config.destDir%>/",
                    "src": ["*.html"],
                    "dest": "<%= config.destDir %>"
                }]
            }
            // ,
            // "pages": {
            //     options: {
            //         removeComments: true,
            //         collapseWhitespace: true
            //     },
            //     "files": [{
            //         "expand": true,
            //         "cwd": "<%= config.destDir%>/",
            //         "src": ["pages/*/*.html"],
            //         "dest": "<%= config.destDir %>"
            //     }]
            // }
        },

        cssmin: {
            transformer: {
                files: {
                    //          "cwd": "<%= config.destDir%>/",
                    '<%= config.destDir%>/static/css/transformer.min.css': [
                        "<%= config.destDir%>/static/css/*.css"
                    ]
                }
            },
            carpool: {
                files: {
                    //          "cwd": "<%= config.destDir%>/",
                    '<%= config.destDir%>/static/css/bus.min.css': [
                        "<%= config.destDir%>/static/css/*.css"
                    ]
                }
            },
            common: {
                "files": [{
                    '<%= config.destDir%>/static/css/contactadd.css': [
                        "<%= config.destDir%>/static/css/contactadd.css"
                    ]
                }, {
                    '<%= config.destDir%>/static/css/contacts.css': [
                        "<%= config.destDir%>/static/css/contacts.css"
                    ]
                }, {
                    '<%= config.destDir%>/static/css/ecoupon.css': [
                        "<%= config.destDir%>/static/css/ecoupon.css"
                    ]
                }]
            },
            static: {
                files: {
                    '<%= config.destDir%>/css/global.min.css': [
                        "<%= config.destDir%>/css/*.css"
                    ]
                }
            }
        },


        clean: {
            options: {
                force: true
            },
            main: '<%= config.destDir%>',
            clean_node: '<%= config.destDir%>/node_modules'
        },

        "strip": {
            "main": {
                "src": "<%= config.destDir %>/**/*.js",
                "options": {
                    "inline": true
                }
            }
        },

        //requireJS没有包含的文件也需要移过去
        "uglify": {
            "main": {
                "options": {
                    "report": "false",
                    "mangle": {
                        "except": ['$super']
                    }
                },
                "files": [{
                    "expand": true,
                    "cwd": "<%= config.srcDir %>",
                    "src": "**/*.js",
                    "dest": "<%= config.destDir %>"
                }]
            }
        },
        //替换文中静态资源，并加上版本号
        replace: {
            removeScript: {
                options: {
                    patterns: [{
                        match: /<script.*?>.*?<\/script>/ig,
                        replacement: ''
                    }]
                },
                files: [{
                    expand: true,
                    flatten: true,
                    src: ['<%= config.destDir %>/*.html'],
                    dest: '<%= config.destDir %>/'
                }]
            },
            insertScript: {
                options: {
                    patterns: [{
                        match: /<\/body>/,
                        replacement: '<script type="text/javascript" src="../blade/libs/require.js?v=<%= new Date().getTime() %>"></script></body>'
                    }]
                },
                files: [{
                    expand: true,
                    flatten: true,
                    src: ['<%= config.destDir %>/*.html'],
                    dest: '<%= config.destDir %>/'
                }]
            },
            removeScriptHtml: {
                options: {
                    patterns: [{
                        match: /<\/body>/,
                        replacement: '</body>'
                    }]
                },
                files: [{
                    expand: true,
                    flatten: true,
                    src: ['<%= config.srcDir %>/map.html'],
                    dest: '<%= config.destDir %>/'
                }]
            },

            removeLink: {
                options: {
                    patterns: [{

                        match: /<link [^>]*href=['"]([^'"]+)[^>]*>/gi,
                        replacement: ''
                    }]
                },
                files: [{
                    expand: true,
                    flatten: true,
                    src: ['<%= config.destDir %>/*.html'],
                    dest: '<%= config.destDir %>/'
                }]
            },
            insertLink: {
                options: {
                    patterns: [{
                        match: /<title>/,
                        replacement: '<link rel="icon" href="favicon.ico" type="image/x-icon" /><link href="../static/css/global.min.css?v=<%= new Date().getTime() %>" rel="stylesheet" type="text/css" /><title>'
                    }]
                },
                files: [{
                    expand: true,
                    flatten: true,
                    src: ['<%= config.destDir %>/*.html'],
                    dest: '<%= config.destDir %>/'
                }]
            }
        }

    });

    grunt.loadNpmTasks('grunt-contrib-requirejs');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-strip');
    grunt.loadNpmTasks('grunt-contrib-compress');
    grunt.loadNpmTasks('grunt-replace');
    grunt.loadNpmTasks('grunt-contrib-htmlmin');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-cachebuster');

    //遍历频道目录时用得到
    var fs = require("fs");

    grunt.registerTask('default', 'default task', function () {
        var pkg = grunt.file.readJSON('package.json');
        var t = pkg.channels;
        var tasks = [],
            k, v, item;
        for (k in t) {
            v = t[k];
            item = 'blade:' + k
            tasks.push(item)
        }

        grunt.task.run(tasks);

    });
    function pushTasks(tasks, newTasks) {
        for (var i = 0; i < newTasks.length; i++) {
            tasks.push(newTasks[i]);
        }
    }

    var fileList = {};

    function walk(path, parent) {
        var dirList = fs.readdirSync(path);
        dirList.forEach(function (item) {

            if (fs.statSync(path + '/' + item).isDirectory()) {
                fileList[item] = [];
                walk(path + '/' + item, item);
            } else {

                if (parent && fileList[parent]) {
                    fileList[parent].push(item);
                }
            }
        });

    }

    //处理频道数据
    function handleData(d) {

        var data = {};
        var tmp = {};
        var arr = [];
        var _file = '';

        for (var k in d) {
            tmp = {
                css: [],
                html: [],
                js: []
            };
            arr = d[k];

            for (var i = 0; i < arr.length; i++) {
                _file = arr[i];
                if (_file.indexOf('.css') != -1) {
                    tmp.css.push(_file);
                } else if (_file.indexOf('.html') != -1) {
                    tmp.html.push(_file);
                } else if (_file.indexOf('.js') != -1) {
                    tmp.js.push(_file.substr(0, _file.length - 3));
                }
            }

            data[k] = tmp;
        }

        return data;
    }

    grunt.registerTask('blade', 'require demo', function (channel) {
        //默认打框架包
        if (!channel) channel = 'app';
        var tasks = ['clean:main', 'uglify', 'copy:template', 'copy:project', 'strip', 'clean:clean_node', 'requirejs'];
        // tasks = ['clean:main', 'copy:template', 'copy:project','strip', 'clean:clean_node', 'requirejs'];


        var pkg = grunt.file.readJSON('package.json');
        var config = {
            srcDir: pkg.channels[channel].src,
            destDir: pkg.channels[channel].dest,
            channelPath: pkg.channels[channel].channelPath
        };
        var replaceTasks = ['replace:removeScript', 'replace:insertScript', 'replace:removeLink'];
        grunt.config.set('config', config);

        if (channel == 'static') {
            tasks = ['clean:main', 'copy:static', 'cssmin:static', 'strip', 'clean:clean_node'];
            //加入md5逻辑
            tasks.push('cachebuster');
            grunt.config.set('cachebuster', getCacheCfg(config, channel));
            grunt.task.run(tasks);


            return;
        }

        if (channel != 'app' && channel != 'static') {
            tasks[tasks.length - 1] = 'htmlmin';
            tasks.push('cssmin:' + channel);
            //tasks.push('replace');
            pushTasks(tasks, replaceTasks);
            tasks.push('replace:insertLink');
            tasks.push('replace:removeScriptHtml');
            tasks.push('requirejs');
        }

        var cfg = grunt.file.readJSON(pkg.channels[channel].src + '/gruntcfg.json');

        if (channel != 'app' && channel != 'static') {

            //频道页面目录
            var channelPath = pkg.channels[channel].src + '/pages';
            walk(channelPath);
            var pageData = handleData(fileList);

            var css = [];
            var html = [];
            var jsArr = [];

            //设置 require 配置;

            for (var key in pageData) {

                cfg.requirejs[channel + '_' + key] = {
                    options: {
                        "uglify": cfg.requirejs.blade.options.uglify,
                        "shim": cfg.requirejs.blade.options.shim,
                        "paths": cfg.requirejs.blade.options.paths,
                        "exclude": cfg.requirejs.blade.options.pagesexclude,
                        "baseUrl": config.srcDir,
                        "out": config.destDir + '/pages/' + key + '/' + key + '.js',
                        "include": []
                    }
                };

                css = pageData[key].css;
                html = pageData[key].html;
                jsArr = pageData[key].js;

                for (var i = 0; i < css.length; i++) {
                    cfg.requirejs[channel + '_' + key].options.include.push('text!' + config.channelPath + '/' + key + '/' + css[i]);
                }

                for (i = 0; i < html.length; i++) {
                    cfg.requirejs[channel + '_' + key].options.include.push('text!' + config.channelPath + '/' + key + '/' + html[i]);
                }

                for (i = 0; i < jsArr.length; i++) {
                    if (key == jsArr[i]) {
                        cfg.requirejs[channel + '_' + key].options.include.push('pages/' + key + '/' + jsArr[i]);
                    } else {
                        cfg.requirejs[channel + '_' + key].options.include.push(config.channelPath + '/' + key + '/' + jsArr[i]);
                    }
                }

            }

        }
        grunt.config.set('requirejs', cfg.requirejs);

        //加入md5逻辑
        tasks.push('cachebuster');
        grunt.config.set('cachebuster', getCacheCfg(config, channel));

        grunt.task.run(tasks);
        grunt.task.run('bladeMd5:' + channel);

    });

    grunt.registerTask('bladeMd5', 'require demo', function (channel) {
        if (channel != 'static') {

            //默认打框架包
            if (!channel) channel = 'app';
            var tasks = [];

            var pkg = grunt.file.readJSON('package.json');
            var config = {
                srcDir: pkg.channels[channel].src,
                destDir: pkg.channels[channel].dest,
                channelPath: pkg.channels[channel].channelPath,
                dest: pkg.dest
            };

            var copyData = grunt.config.data.copy;
            var copyCfg = getCopyCfg(config, channel);
            for (var k in copyCfg) {
                copyData[k] = copyCfg[k];
                tasks.push('copy:' + channel + '_md5');
            }
            grunt.config.set('copy', copyData);

            //执行最后的md5替换动作
            var replaceData = grunt.config.data.replace;
            var replaceCfg = md5Replace(config, channel);

            replaceData[channel + '_md5'] = replaceCfg[channel + '_md5'];

            tasks.push('replace:' + channel + '_md5');

            grunt.config.set('replace', replaceData);

            grunt.task.run(tasks);
        }


    });

    function md5Replace(config, channel) {
        var md5Cfg = grunt.file.readJSON(config.destDir + '/md5.json');
        md5Cfg = md5Cfg.src;
        var cfg = {}, tmp = {}, cfgStr = '<script type="text/javascript">';

        if (channel == 'app') {
            cfg[channel + '_md5'] = {
                options: {
                    patterns: [{
                        match: /require\.config\(\{paths:\{\}\}\);/,
                        replacement: 'require.config({paths:{libs: "../blade/' + md5Cfg.libs + '"}});'
                    }]
                },
                files: [{
                    expand: true,
                    flatten: true,
                    src: [config.destDir + '/libs/require.js'],
                    dest: config.destDir + '/libs/'
                }]
            }
        } else {
            for (var k in md5Cfg) {
                if (k == 'main') continue;
                tmp['pages/' + k + '/' + k] = 'pages/' + k + '/' + md5Cfg[k];
            }

            cfgStr += 'require.config({paths:'

            cfgStr += JSON.stringify(tmp) + '});';

            cfgStr += 'require(["libs"], function(){require(["' + md5Cfg.main + '"], function(){})});';

            cfgStr += '</script>';

            cfg[channel + '_md5'] = {
                options: {
                    patterns: [{
                        match: /<\/body>/,
                        replacement: cfgStr + '</body>'
                    }]
                },
                files: [{
                    expand: true,
                    flatten: true,
                    src: [config.destDir + '/*.html'],
                    dest: config.destDir + '/'
                }]
            };
        }

        return cfg;
    }

    function getCopyCfg(config, channel) {
        var cfg = {};
        var md5Cfg = grunt.file.readJSON(config.destDir + '/md5.json');
        md5Cfg = md5Cfg.dest;

        cfg[channel + '_md5'] = {
            "files": {}
        }

        for (var k in md5Cfg) {
            cfg[channel + '_md5'].files[md5Cfg[k]] = [k];
        }

        return cfg;
    }

    function getCacheCfg(config, channel) {
        var cacheCfg = {};

        console.log(channel)

        cacheCfg[channel] = {
            options: {
                format: 'json',
                length: 5,
                formatter: function (hashes) {

                    var output = {dest: {}, src: {}};
                    var filename, name, name2, i, postfix;

                    for (filename in hashes) {

                        //如果包含pages目录,并且js名字和文件名一致才行
                        if (filename.indexOf('/pages/') != -1) {
                            i = filename.lastIndexOf('/pages/');
                            name = filename.substr(i + 6, filename.length - 1);
                            i = name.lastIndexOf('.');
                            name = name.substr(1, i - 1);
                            name = name.split('/');
                            if (name.length != 2 || name[0] != name[1]) continue;
                        }

                        i = filename.lastIndexOf('.');
                        name = filename.substr(0, i);
                        postfix = filename.substr(i, filename.length);
                        output.dest[filename] = name + '.' + hashes[filename] + postfix;

                        i = name.lastIndexOf('/');
                        name = name.substr(i + 1, name.length - 1);
                        output.src[name] = name + '.' + hashes[filename];

                    }

                    return JSON.stringify(output);

                }
            },
            //src: [ 'src/assets/filename1', 'src/assets/folder1/filename2' ],
            //dest: 'target/cachebusters.json'

            src: [config.destDir + '/css/global.min.css', config.destDir + '/libs.js', config.destDir + '/main.js', config.destDir + '/pages/*/*.js',],
            dest: config.destDir + '/md5.json'
        };

        return cacheCfg;
    }


}