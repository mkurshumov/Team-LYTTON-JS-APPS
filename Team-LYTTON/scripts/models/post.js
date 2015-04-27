var app = app || {};
app._model = app._model || {};

app._model.post = (function () {
    function Post(baseUrl, ajaxRequester) {
        this._requester = ajaxRequester;
        this._posts = {
            posts: []
        }
    }

    Post.prototype.getAuthor = function () {
        var defer = Q.defer();
        this._requester.get('sessions/me')
            .then(function (sessionData) {
                defer.resolve(sessionData.user);
            }, function (error) {
                defer.reject(error.responseText);
            });
        return defer.promise;
    };

    Post.prototype.createPost = function (data) {
        var defer = Q.defer();
        var _this = this;
        this.getAuthor()
            .then(function (author) {
                data.author = author;
                _this._requester.post('classes/Post', data)
                    .then(function(_data){
                        defer.resolve(_data);
                    });
            }, function (error) {
                defer.reject(error);
            });
        return defer.promise;
    };

    Post.prototype.getPosts = function (url) {
        var defer = Q.defer();
        var _this = this;
        this._posts['posts'].length = 0;

        this._requester.get(url)
            .then(function (data) {
                data['results'].forEach(function (dataPost) {
                    var post = {
                        'objectId': dataPost.objectId,
                        'title': dataPost.title,
                        'content': dataPost.content,
                        'contentSummary': dataPost.contentSummary,
                        'tags': dataPost.tags,
                        'visitsCount': dataPost.visitsCount,
                        'author': dataPost.author.username,
                        'authorId': dataPost.author.objectId,
                        'createdAt': new Date(dataPost.createdAt).toLocaleString()
                    };

                    if(dataPost.headerImage){
                        post.image = dataPost.headerImage.url;
                    }
                    _this._posts['posts'].push(post);
                });

                defer.resolve(_this._posts);
            }, function (error) {
                defer.reject(error);
            });

        return defer.promise;
    };

    Post.prototype.getPostsCount = function(url){
        var defer = Q.defer();
        var _this = this;

        this._requester.get(url)
            .then(function (data) {
                defer.resolve(data.count);
            }, function (error) {
                defer.reject(error);
            });

        return defer.promise;
    };

    Post.prototype.getPost = function(id){
        var defer = Q.defer();
        var _this = this;
        this._posts['posts'].length = 0;

        this._requester.get('classes/Post/' + id + '?include=author')
            .then(function (dataPost) {
                var post = {
                    'objectId': dataPost.objectId,
                    'title': dataPost.title,
                    'content': dataPost.content,
                    'tags': dataPost.tags,
                    'author': dataPost.author,
                    'visitsCount': dataPost.visitsCount,
                    'createdAt': dataPost.createdAt
                };

                if(dataPost.headerImage){
                    post.image = dataPost.headerImage.url;
                }
                _this._posts['posts'].push(post);

                defer.resolve(_this._posts);
            }, function (error) {
                defer.reject(error);
            });

        return defer.promise;
    };

    Post.prototype.visitsIncrement = function(postId){
        var defer = Q.defer();

        var data = {
              "postId": postId
        };

        this._requester.post('functions/incrementViewCount', data)
            .then(function () {
                defer.resolve('success');
            }, function (error) {
                defer.reject(error);
            });
    };

    return {
        get: function (baseUrl, ajaxRequester) {
            return new Post(baseUrl, ajaxRequester);
        }
    }
}());
