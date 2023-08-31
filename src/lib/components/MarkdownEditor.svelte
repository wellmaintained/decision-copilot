<script lang="ts">
    import { onDestroy, onMount } from 'svelte';
	import { createEventDispatcher } from 'svelte';

    export let value:string = '';

    const dispatch = createEventDispatcher();

    let markdown_textarea: HTMLTextAreaElement;

    let easyMDE: any = null;

    onMount(async () => {
        if (markdown_textarea == null) {
            console.error('No textarea element found');
            return;
        } 
        if (easyMDE!==null) {
            console.log('EasyMDE already initialized for', markdown_textarea);
            return;
		}

        console.log('Initializing EasyMDE for', markdown_textarea)
        const easyMDE_module = await import('easymde');
        // config instructions: https://github.com/Ionaru/easy-markdown-editor?tab=readme-ov-file#configuration
        easyMDE = new easyMDE_module.default({
            element: markdown_textarea,
            sideBySideFullscreen: false,
            spellChecker: false,
            status: false,
            minHeight: '200px',
        });
        easyMDE.value(value || '');
        easyMDE.codemirror.on("blur", () => {
            dispatch('blur', easyMDE.value())
        });			
	});

    onDestroy(() => {
        console.log('Cleaning up EasyMDE');
        if (easyMDE) {
            easyMDE.cleanup();
            easyMDE.toTextArea();
            easyMDE = null;
        }
    });
    $: {
        // update the value of the editor when the value prop changes
        if (easyMDE) {
            easyMDE.value(value || '');
        }
    }
</script>

<textarea bind:this={markdown_textarea}></textarea>