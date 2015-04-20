var app = app || {};

app.blogView = (function(){
    function BlogView(selector, data) {
        $.get('templates/blog.html', function(template) {
            var output = Mustache.render(template);
            $(selector).html(output);
        })
    }

    return {
        load: function (selector, data) {
            return BlogView(selector, data);
        }
    }
})();