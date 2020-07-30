<template>
  <div class="grid icons">
    <div class="gridCell" v-for="icon in icons">
      <img :src="`${icon['path']}`" />
      {{icon['name']}}
    </div>
  </div>
</template>

<script>
export default {
  name: 'IconGrid',
  data() {
    return {
      icons: []
    };
  },
  mounted() {
    this.importAllIcons(require.context('@assets/img/icon/', false, /^.*\.svg$/));
  },
  methods: {
    importAllIcons(r) {
      r.keys().forEach(key => (
        this.icons.push({
          path: r(key),
          name: key.replace('./','')
            .replace('.svg', '')
            .replace('-', ' ')
            .toLowerCase()
            .split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ')
        })
      ));
    }
  }
};
</script>
