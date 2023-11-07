<script lang="ts">
  export let active: boolean;
  export let classes: string[];
  // const children = document.querySelectorAll('*:has(> .loading-spinner) > *:not(.loading-spinner)');
  // const childrenDisplays = new Map();
  //
  // for (const child of children) {
  //   childrenDisplays.set(child, getComputedStyle(child).getPropertyValue('display'));
  // }
</script>

<div
  class="loading-spinner {classes.join(' ')}"
  style="display: {active ? 'block' : 'none'};"
>
  <div />
  <div />
  <div />
  <div />
</div>
