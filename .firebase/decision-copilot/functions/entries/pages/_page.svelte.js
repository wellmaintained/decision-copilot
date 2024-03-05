import { c as create_ssr_component } from "../../chunks/ssr.js";
const Page = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  return `<h1 class="text-green-600" data-svelte-h="svelte-1vckeb7">Welcome to SvelteKit</h1> <p data-svelte-h="svelte-jl9sbz">Visit <a href="https://kit.svelte.dev">kit.svelte.dev</a> to read the documentation</p> <button class="btn btn-primary" data-svelte-h="svelte-7xkr8l">Click me!</button>`;
});
export {
  Page as default
};
