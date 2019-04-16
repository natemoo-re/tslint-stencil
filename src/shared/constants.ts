export const LIFECYCLE_METHODS = [
  "componentWillLoad",
  "componentDidLoad",
  "componentWillUpdate",
  "componentDidUpdate",
  "componentDidUnload"
];

export const STENCIL_METHODS = ["hostData", "render"];

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
  "stencil-method": "render() or hostData() methods",
  watch: "@Watch methods",
  "watched-prop": "@Prop properties with a watcher",
  "watched-state": "@State properties with a watcher"
};
