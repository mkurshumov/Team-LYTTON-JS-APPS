var app = app || {};

app.controller = (function () {

    function Controller(model) {
        this.model = model;
    }

    Controller.prototype.loadMenu = function (selector) {
        var _this = this;
        if (sessionStorage['logged-in']) {
            app.userMenuView.load(selector)
                .then(function () {
                    _this.attachLogoutEvents('#logout a');
                    _this.attachSearchEvents('#search');
                });
        } else {
            app.menuView.load(selector)
                .then(function () {
                    _this.attachSearchEvents('#search');
                });
        }
    };

    Controller.prototype.attachSearchEvents = function(selector){
        $(selector).click(function(){
            var tag = $('#search-input').val().trim();
            if(tag){
                window.location.replace('#/tag/' + tag);
            }
        });

        $(document).on('keyup', '#search-form', function (event) {
            event.preventDefault();
            if(event.keyCode === 13){
                $(selector).trigger('click');
            }
        });

        $(document).on('keypress', '#search-form', function (event) {
            return event.keyCode !== 13;
        });
    };

    Controller.prototype.getLoginPage = function (selector) {
        var _this = this;
        app.loginView.load(selector)
            .then(function () {
                _this.attachLoginEvents('#login-btn');
                $('#register-btn').click(function () {
                    window.location.replace('#/register');
                })
            })
    };

    Controller.prototype.attachLoginEvents = function (selector) {
        var _this = this;
        $(selector).click(function () {
            var username = ($("input[id=login-username]").val());
            var password = ($("input[id=login-password]").val());

            _this.model.user.logIn(username, password)
                .then(function (data) {
                    sessionStorage['logged-in'] = data.sessionToken;
                    sessionStorage['id'] = data.objectId;
                    window.location.replace('#/blog');
                    Noty.success('Successfully logged in!');
                },
                function (errorData) {
                    Noty.error(JSON.parse(errorData.responseText).error);
                });
        });
    };

    Controller.prototype.attachLogoutEvents = function (selector) {
        var _this = this;
        $(selector).click(function () {
            _this.model.user.logOut()
                .then(function () {
                    sessionStorage.clear();
                    window.location.replace('#/blog');
                    _this.loadMenu('nav');
                    Noty.success('Goodbye!');
                },
                function (errorData) {
                    Noty.error(JSON.parse(errorData.responseText).error);
                });
        });
    };

    Controller.prototype.getProfilePage = function (selector) {
        var _this = this;
        app.profileView.load(selector)
            .then(function () {
                _this.attachProfilePageEvents('#save-btn');
                var userId = sessionStorage['id'];
                _this.model.user.getUserById(userId)
                    .then(function (data) {
                        $('#username').val(data.username);
                        $('#email').val(data.email);
                        $('#firstName').val(data.firstName);
                        $('#middleName').val(data.middleName);
                        $('#lastName').val(data.lastName);
                        $("#gender").val(data.gender);
                    }, function (error) {
                        Noty.error(JSON.parse(error.responseText).error);
                    });
            }, function (error) {
                Noty.error(JSON.parse(error.responseText).error);
            })
    };

    Controller.prototype.attachProfilePageEvents = function (selector) {
        var _this = this;

        $(selector).click(function (event) {
            if ($('#password').val()) {
                var userData = {
                    username: $("input[id=username]").val(),
                    password: $("input[id=password]").val(),
                    email: $("input[id=email]").val(),
                    firstName: $("input[id=firstName]").val(),
                    middleName: $("input[id=middleName]").val(),
                    lastName: $("input[id=lastName]").val(),
                    gender: $("#gender").val()
                };
            } else {
                var userData = {
                    username: $("input[id=username]").val(),
                    email: $("input[id=email]").val(),
                    firstName: $("input[id=firstName]").val(),
                    middleName: $("input[id=middleName]").val(),
                    lastName: $("input[id=lastName]").val(),
                    gender: $("#gender").val()
                };
            }

            _this.model.user.updateUser(sessionStorage['id'], userData)
                 .then(function (data) {
                    sessionStorage.clear();
                    window.location.replace('#/blog');
                    Noty.success('Profile edited successfully.');
                }, function(error) {
                    Noty.error('Error saving changes. Please try again.');
                });
        });

        _this.attachPictureUploadEvents('#upload-file-button');

        $('#cancel-btn').click(function () {
            window.location.replace('#/blog');
        });

        $('#delete-btn').click(function () {
            _this.model.user.deleteUser(sessionStorage['id'])
                 .then(function () {
                    sessionStorage.clear();
                    window.location.replace('#/');
                    _this.loadMenu('nav');
                    Noty.success('Profile deleted successfully.');
                }, function (error) {
                   Noty.error(JSON.parse(error.responseText).error);
                });
        });
    };
	
	Controller.prototype.attachPictureUploadEvents = function (selector) {
        var file;

        $('#picture').bind("change", function(e) {
            var files = e.target.files || e.dataTransfer.files;
            file = files[0];
        });

        //TEST
        //$('#picture').bind("change", function (e) {
        //    var fileUploadControl = $("#upload-file-button")[0];
        //    var file = fileUploadControl.files[0];
        //    var name = file.name; //This does *NOT* need to be a unique name
        //    var parseFile = new Parse.File(name, file);
        //
        //    parseFile.save().then(function () {
        //        var profilePicture = new Parse.Object("ProfilePicture");
        //        profilePicture.set("pic", parseFile);
        //        profilePicture.save();
        //    }, function (error) {
        //
        //    });
        //});

        $(selector).click(function() {
            var serverUrl = 'https://api.parse.com/1/files/' + file.name;

                $.ajax({
                    method: "POST",
                    headers: {
                        'X-Parse-Application-Id': 'gBxtJ8j1z5sRZhOgtAstvprePygEIvYTxY4VNQOY',
                        'X-Parse-REST-API-Key': 'CLU5dIerpE1k9zX06HiR3RxJQA3Vob2NgJarCl4z',
                        'Content-Type': file.type
                    },
                    url: serverUrl,
                    data: file,
                    processData: false,
                    contentType: false,
                    success: function(data) {
                        //sessionStorage['pictureUrl'] = data.url;
                        //See console to see the uploaded picture url
                        console.log(data.url);
                        alert('Upload success!');
                    },
                    error: function(data) {
                        var obj = $.parseJSON(data);
                        alert(obj.error);
                    }
                });
            });
    };

    Controller.prototype.getRegisterPage = function (selector) {
        var _this = this;
        app.registerView.load(selector)
            .then(function () {
                _this.attachRegisterEvents('#reg-btn');
                $('#login-btn').click(function() {
                    window.location.replace('#/login');
                })
            }, function (error) {
                Noty.error(JSON.parse(error.responseText).error);
            })
    };

    Controller.prototype.attachRegisterEvents = function (selector) {
        var _this = this;
        _this.attachPictureUploadEvents('#upload-file-button');

        $("input[id=reg-password], input[id=repeat-password]").keyup(function () {
            $('#result').empty();
            if(($("input[id=reg-password]").val()).length >= 6) {
                var passwordStrength = validation.checkPasswordStrength($("input[id=reg-password]").val());
                switch (passwordStrength) {
                    case 'weak':
                        $('#resultLabel').show();
                        $('#result').html(passwordStrength).css({"background-color": "red"});
                        break;

                    case 'medium':
                        $('#resultLabel').show();
                        $('#result').html(passwordStrength).css({"background-color": "deepskyblue"});
                        break;

                    case 'good':
                        $('#resultLabel').show();
                        $('#result').html(passwordStrength).css({"background-color": "blue"});
                        break;

                    case 'strong':
                        $('#resultLabel').show();
                        $('#result').html(passwordStrength).css({"background-color": "green"});
                        break;

                    case 'excellent':
                        $('#resultLabel').show();
                        $('#result').html(passwordStrength).css({"background-color": "greenyellow"});
                        break;
                }
            } else {
                $('#resultLabel').hide();
                $('#result').html('Password is too short').css({"background-color": "red", "font-weight": "bold", "color" : "white"})
            }
        }); // pasword strength function

        $("input[id=repeat-password], input[id=reg-password]").keyup(function () {
            if(!validation.checkIfPasswordsMatch($("input[id=repeat-password]").val(), $("input[id=reg-password]").val())) {
                $('#passwordMatch').html('Both passwords do not match.').css({"background-color": "red", "font-weight": "bold", "color" : "white"});
            } else {
                $('#passwordMatch').empty();
            }
        }); // password match function

        $("input[id=reg-email]").keyup(function () {
            var isValid = validation.checkEmail($("input[id=reg-email]").val());
            if(isValid === null) {
                $('#checkEmail').html('This email is NOT valid').css({"background-color": "red", "font-weight": "bold", "color" : "white"});
            } else {
                $('#checkEmail').hide();
            }
        });

        $(selector).click(function () {
            var userRegData = {
                username: $("input[id=reg-username]").val(),
                password: $("input[id=reg-password]").val(),
                passwordRepeat: $("input[id=repeat-password]").val(),
                email: $("input[id=reg-email]").val(),
                firstName: $("input[id=reg-firstName]").val(),
                middleName: $("input[id=reg-midName]").val(),
                lastName: $("input[id=reg-lastName]").val(),
                gender: $('#gender').val()
            };
            _this.model.user.register(userRegData)
                .then(function (data) {
                    Noty.success('Registration Successful');
                    sessionStorage['logged-in'] = data.sessionToken;
                    sessionStorage['id'] = data.objectId;
                    window.location.replace('#/blog');
                }, function (error) {
                    Noty.error(JSON.parse(error.responseText).error);
                })
        });
    };

    Controller.prototype.getBlogPage = function (selector, page) {
        $(selector).empty();

        var _this = this;

        app.postArticle.load(selector)
            .then(function () {
                _this.attachBlogEvents('#postArticle')
            }, function (error) {
                console.log(error.responseText);
            });

            _this.model.post.getPosts('classes/Post?include=author&order=-createdAt')
                .then(function (data) {
                    $('#posts').hide();
                    var postsCount = Object.keys(data.posts).length;
                    app.blogView.load('#posts', data);

                    _.each(data.posts,function(p) {
                        _this.model.comment.getPostCommentsCount(p.objectId)
                            .then(function(c){
                                $('article#'+ p.objectId + ' .comments-count').text(c.count);
                            }, function(error){
                                Noty.error(JSON.parse(error.responseText).error);
                            });
                    });

                    _this.model.comment.getComment()
                        .then(function () {
                            if(postsCount > 0) {
                                $('<ul class="pagination" id="pagination"></ul>').insertAfter($('#post-section'));
                                $('#posts').pageMe({pagerSelector:'#pagination',showPrevNext:true,hidePageNumbers:false,perPage:5});
                                $('#posts').fadeIn();
                            }
                        }, function (error) {
                            console.log(error.responseText);
                        });
                }, function (error) {
                    Noty.error(JSON.parse(error.responseText).error);
                });
     };

    Controller.prototype.attachCommentEvents = function (selector, commentsSelector) {
        var _this = this;

        $(document).on('click', selector, function(event){
            var id = event.target['id'];
            var data = {
                author: $(this).parent().find('input[id=author]').val(),
                content: $(this).parent().find('input[id=content]').val(),
                email: $(this).parent().find('input[id=email]').val(),
                postId: id,
                'post': {
                    __type: "Pointer",
                    className: "Post",
                    objectId: id
                }
            };

            _this.model.comment.createComment(data)
                .then(function (commentData) {
                    Noty.success('Comment posted successfully.');
                    _this.model.comment.getPostComments(id)
                        .then(function (commentsData) {
                            $(commentsSelector).empty();
                            app.commentView.load(commentsSelector, commentsData);
                        }, function (error) {
                            Noty.error(JSON.parse(error.responseText).error);
                        });
                }, function (error) {
                    Noty.error(JSON.parse(error.responseText).error);
                });
        });
    };

    Controller.prototype.attachBlogEvents = function (selector) {
        $(document).on('change', '.btn-file :file', function() {
            var input = $(this),
                numFiles = input.get(0).files ? input.get(0).files.length : 1,
                label = input.val().replace(/\\/g, '/').replace(/.*\//, '');
            input.trigger('fileselect', [numFiles, label]);
        });

        $(document).ready( function() {
            $('.btn-file :file').on('fileselect', function(event, numFiles, label) {

                var input = $(this).parents('.input-group').find(':text'),
                    log = numFiles > 1 ? numFiles + ' files selected' : label;

                if( input.length ) {
                    input.val(log);
                } else {
                    if( log ) alert(log);
                }
            });
        });

        var _this = this;

        $(selector).click(function () {
            var uniqueTags =
                _.uniq($("input[id=tags]").val().trim().split(','))
                .filter(function(tag){
                    return tag !== "";
                });

            var _data = {
                title: $("input[id=title]").val(),
                content: $("textarea[id=content]").val(),
                visitsCount: 1,
                tags: uniqueTags,
                tags_lower: _.map(uniqueTags, function(tag){
                    return _.isString(tag) ? tag.toLowerCase() : tag;
                })
            };

            _this.model.post.createPost(_data)
                .then(function () {
                    $('#posts').empty();
                    _this.model.post.getPosts('classes/Post?include=author&order=-createdAt&limit=5&skip=0')
                        .then(function (data) {
                            Noty.success('Article posted successfully');
                            app.blogView.load('#posts', data);
                        }, function (error) {
                            Noty.error(JSON.parse(error.responseText).error);
                        })
                }, function (error) {
                    Noty.error(JSON.parse(error.responseText).error);
                })
        });
    };

    Controller.prototype.getHomePage = function (selector) {
        app.homeView.load(selector);
    };

    Controller.prototype.getSidebar = function (selector, tagsFunction, tagsClassName, tagsLimit) {
        $(selector).empty();

        this.model.sidebar.getLatestPosts()
            .then(function (data) {
                app.sidebarView.load(selector, data);
            }, function (error) {
                Noty.error(JSON.parse(error.responseText).error);
            });

        var data = {
            'className': tagsClassName,
            'limit': tagsLimit
        };

        this.model.sidebar.getMostPopularTags(tagsFunction, data)
            .then(function (data) {
                app.sidebarView.load(selector, data);
            }, function (error) {
                Noty.error(JSON.parse(error.responseText).error);
            });
    };

    Controller.prototype.getPostPage = function (id, selector) {
        $(selector).empty();
        var _this = this;

        this.model.post.getPost(id)
            .then(function (data) {
                _this.model.comment.getPostComments(id)
                    .then(function(comment){
                        data.posts[0]['commentsCount'] = comment.comments.length;
                        data.comments = comment.comments;
                        app.postView.load(selector, data);
                        _this.attachCommentEvents('.postCommentButton','.comments');
                        _this.model.post.visitsIncrement(id)
                            .then(function(){

                            }, function(error){
                                Noty.error(JSON.parse(error.responseText).error);
                            });
                    }, function(error){
                        Noty.error(JSON.parse(error.responseText).error);
                    });

            }, function (error) {
                Noty.error(JSON.parse(error.responseText).error);
            });
    };

    Controller.prototype.getUserPage = function (id, selector) {
        $(selector).empty();

        this.model.user.getUserById(id)
            .then(function (data) {
                app.userView.load(selector, data);
                            }, function (error) {
                Noty.error(JSON.parse(error.responseText).error);
            });
    };

    Controller.prototype.getTagPage = function (tag, selector) {
        $(selector).empty();
        var _this = this;

        this.model.tag.getPostsByTag(tag)
            .then(function (data) {
                app.blogView.load(selector, data);

                _.each(data.posts,function(p) {
                    _this.model.comment.getPostCommentsCount(p.objectId)
                        .then(function(c){
                            $('article#'+ p.objectId + ' .comments-count').text(c.count);
                        }, function(error){
                            Noty.error(JSON.parse(error.responseText).error);
                        });
                });
            }, function (error) {
                Noty.error(JSON.parse(error.responseText).error);
            });
    };

    return {
        get: function (model) {
            return new Controller(model);
        }
    }
})();
