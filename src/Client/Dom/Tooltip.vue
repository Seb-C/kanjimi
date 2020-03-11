<template>
    <div>This will be pre-compiled {{ foo }}</div>
</template>
<script lang="ts">
    import Vue from 'vue';

    export default Vue.extend({
        data() {
            return {
                foo: 'hello',
            };
        }
    });
</script>
<style scoped>
</style>
