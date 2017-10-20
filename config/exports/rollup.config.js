// rollup.config.js
import commonjs from 'rollup-plugin-commonjs';
import resolve from 'rollup-plugin-node-resolve';
import json from 'rollup-plugin-json';
import builtins from 'rollup-plugin-node-builtins';

export default {
    entry: 'build/module/index.js',
    sourceMap: true,
    plugins: [
        resolve({
            browser: true,
            extensions: [ '.js', '.json' ],
            preferBuiltins: true
        }),
        commonjs({
            namedExports: {
                'node_modules/got/index.js': [ 'post', 'get' ]
            },
            include: 'node_modules/**'
        }),
        json(),
        builtins()
    ]
}
