<template>
	<div
		v-if="!hide"
		class="text-success d-inline-block float-right float-md-none"
	>
		<i class="fas fa-check"></i>
		<div class="align-middle px-2 d-none d-sm-inline-block">Saved!</div>
	</div>
</template>
<script lang="ts">
	import Vue from 'vue';

	export default Vue.extend({
		data() {
			return {
				hide: false,
				hideTimeout: <number|null>null,
			};
		},
		mounted() {
			this.resetTimeout();
		},
		beforeUpdate() {
			this.resetTimeout();
		},
		methods: {
			resetTimeout() {
				if (this.hideTimeout !== null) {
					clearTimeout(this.hideTimeout);
					this.hideTimeout = null;
				}

				this.hideTimeout = setTimeout(() => this.hide = true, 3000);
			},
		},
	});
</script>
<style scoped></style>
