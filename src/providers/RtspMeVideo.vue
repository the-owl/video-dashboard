<template>
  <iframe
    :src="src"
    marginwidth="0"
    marginheight="0"
    @load="$emit('load')"
    allowfullscreen
    seamless="seamless"
  />
</template>

<script>
export default {
  props: ['camera'],
  computed: {
    src () {
      return `https://rtsp.me/embed/${this.camera.id}/`;
    },
  },
}
</script>

<style scoped>
iframe {
  border: none;
  box-sizing: border-box;
  height: 100%;
  margin: 0;
  padding: 0;
  width: 100%;
}
</style>
