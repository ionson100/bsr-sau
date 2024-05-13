import commonjs from "@rollup/plugin-commonjs";
import typescript from "@rollup/plugin-typescript";
import {dts} from "rollup-plugin-dts";
import resolve from "@rollup/plugin-node-resolve";
import postcss from "rollup-plugin-postcss";

// eslint-disable-next-line no-undef
const packageJson = require("./package.json");

export default [

    {

        input: "src/index.ts",
        output: [
            {
                file: packageJson.main,
                format: "cjs",
                sourcemap: false,
            },
            {
                file: packageJson.module,
                format: "esm",
                sourcemap: false,
            },

        ],
        plugins: [

            resolve(),
            commonjs(),
            typescript({ tsconfig: "./tsconfig.json" }),
            postcss(),




            //
        ],
    },
    {
        input: "dist/esm/index.d.ts",
        output: [{ file: "dist/index.d.ts", format: "es" }],
        plugins: [dts()],
        external: [/\.css$/], // telling rollup anything that is .css aren't part of type exports
    },
];