(function (tree) {

//
// A function call node.
//
tree.Call = function (name, args, index, filename, rootpath) {
    this.name = name;
    this.args = args;
    this.index = index;
    this.filename = filename;
    this.rootpath = rootpath;
};
tree.Call.prototype = {
    //
    // When evaluating a function call,
    // we either find the function in `tree.functions` [1],
    // in which case we call it, passing the  evaluated arguments,
    // if this returns null or we cannot find the function, we 
    // simply print it out as it appeared originally [2].
    //
    // The *functions.js* file contains the built-in functions.
    //
    // The reason why we evaluate the arguments, is in the case where
    // we try to pass a variable to a function, like: `saturate(@color)`.
    // The function should receive the value, not the variable.
    //
    eval: function (env) {
        var args = this.args.map(function (a) { return a.eval(env) }),
            result, func;

        if (this.name in tree.functions) { // 1.
            try {
                func = new tree.functionCall(env, this.rootpath);
                result = func[this.name].apply(func, args);
                if (result != null) {
                    return result;
                }
            } catch (e) {
                throw { type: e.type || "Runtime",
                        message: "error evaluating function `" + this.name + "`" +
                                 (e.message ? ': ' + e.message : ''),
                        index: this.index, filename: this.filename };
            }
        }
        
        // 2.
        return new(tree.Anonymous)(this.name +
            "(" + args.map(function (a) { return a.toCSS(env) }).join(', ') + ")");
    },

    toCSS: function (env) {
        return this.eval(env).toCSS();
    }
};

})(require('../tree'));
