var app = app || {};
app._model = app._model || {};

app._model.tag = (function(){
    function Tag(ajaxRequester){
        this._requester = ajaxRequester;
        this._postsByTag = {
            posts: []
        };
    }

    Tag.prototype.getPostsByTag = function(tag){
        var defer = Q.defer();
        var _this = this;
        this._postsByTag['posts'].length = 0;
        var where = {
            'tags': tag
        };

        this._requester.get('classes/Post?where=' + JSON.stringify(where) + '&include=author')
            .then(function (data) {
                data['results'].forEach(function (dataPost) {
                    var post = {
                        'objectId': dataPost.objectId,
                        'title': dataPost.title,
                        'content': dataPost.content,
                        'tags': dataPost.tags,
                        'author': dataPost.author.username,
                        'authorId': dataPost.author.objectId,
                        'createdAt': new Date(dataPost.createdAt).toLocaleString()
                    };
                    _this._postsByTag['posts'].push(post);
                });

                defer.resolve(_this._postsByTag);
            }, function (error) {
                defer.reject(error);
            });

        return defer.promise;
    };

    return {
        get: function (ajaxRequester) {
            return new Tag(ajaxRequester);
        }
    }
}());