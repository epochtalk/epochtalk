<template>
  <div class="grid icons">
    <div class="gridCell" v-for="image in images">
      <img :src="`${image['path']}`" />
      {{image['name']}}
    </div>
  </div>
</template>

<script>
export default {
  name: 'Icon',
  data() {
    return {
      images: []
    };
  },
  mounted() {
    this.importAll(require.context('@assets/img/icon/', true, /\.svg$/));
  },
  methods: {
    importAll(r) {
      r.keys().forEach(key => (
        this.images.push({ path: r(key), name: key.replace('./','').replace('.svg', '') })
      ));
    },
  },
};
</script>
