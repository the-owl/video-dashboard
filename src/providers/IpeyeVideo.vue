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
      return `https://ipeye.ru/ipeye_service/api/iframe.php?iframe_player=1&dev=${
        this.camera.id
      }&tupe=rtmp&autoplay=1&logo=1`;
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
