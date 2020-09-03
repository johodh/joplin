"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils = require('../../utils');
// @ts-ignore: Keep the function signature as-is despite unusued arguments
function installRule(markdownIt, mdOptions, ruleOptions, context) {
    const defaultRender = markdownIt.renderer.rules.link_open;
    markdownIt.renderer.rules.link_open = (tokens, idx, options, env, self) => {
        const Resource = ruleOptions.ResourceModel;
        const token = tokens[idx];
        const src = utils.getAttr(token.attrs, 'href');
        if (!Resource.isResourceUrl(src) || ruleOptions.plainResourceRendering)
            return defaultRender(tokens, idx, options, env, self);
        const r = utils.resourceReplacement(ruleOptions.ResourceModel, src, ruleOptions.resources, ruleOptions.resourceBaseUrl);
        if (typeof r === 'string')
            return r;
        if (r && r.type === 'audio')
            return `<audio controls><source src='${r.src}'></audio><a href=# onclick=ipcProxySendToHost('joplin://${src.substring(2)}')>`;
        if (r && r.type === 'video')
            return `<video style="width:100%" controls><source src='${r.src}'></video>`;
        console.log(context);
        return defaultRender(tokens, idx, options, env, self);
    };
}
function default_1(context, ruleOptions) {
    return function (md, mdOptions) {
        installRule(md, mdOptions, ruleOptions, context);
    };
}
exports.default = default_1;
//# sourceMappingURL=media.js.map