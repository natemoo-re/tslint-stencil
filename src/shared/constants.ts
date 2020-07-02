export const LIFECYCLE_METHODS = [
  "connectedCallback",
  "componentWillLoad",
  "componentWillRender",
  "componentShouldUpdate",
  "componentWillUpdate",
  "componentDidRender",
  "componentDidLoad",
  "componentDidUpdate",
  "componentDidUnload",
  "disconnectedCallback"
];

export const STENCIL_METHODS = ["render"];

export const VERBOSE_COMPONENT_MEMBERS: Record<string, string> = {
  element: "@Element property",
  event: "@Event properties",
  "internal-prop": "internal properties",
  lifecycle: "lifecycle methods",
  listen: "@Listen methods",
  "own-method": "regular internal methods",
  "own-prop": "regular internal properties",
  prop: "@Prop properties without watcher",
  state: "@State properties without watcher",
  "stencil-method": "render() method",
  watch: "@Watch methods",
  "watched-prop": "@Prop properties with a watcher",
  "watched-state": "@State properties with a watcher"
};
