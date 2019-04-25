<template>
  <div class='menu-panel'>
    <top-bar :menuMode='true' :ok='ok' :closable='true' @close='$emit("close")'>
      Меню
    </top-bar>
    <section :class='{ open: isOpen("log") }'>
      <h2 class='header' @click='toggle("log")'>
        Лог ошибок
        <span class='arrow'>▶</span>
      </h2>
      <div class='content'>
        <error-log :messages='messages' />
      </div>
    </section>
    <section :class='{ open: isOpen("log2") }'>
      <h2 class='header' @click='toggle("log2")'>
        Настройки
        <span class='arrow'>▶</span>
      </h2>
      <div class='content'>
        <local-settings :settings='settings' :cameras='cameras' />
      </div>
    </section>
  </div>
</template>

<script>
  import ErrorLog from './ErrorLog';
  import LocalSettings from './LocalSettings';
  import TopBar from './TopBar';

  export default {
    components: {
      ErrorLog, LocalSettings, TopBar
    },
    data () {
      return {
        open: 'log'
      };
    },
    methods: {
      isOpen (what) {
        return this.open === what;
      },
      toggle (what) {
        this.open = what;
      }
    },
    props: ['cameras', 'messages', 'ok', 'settings']
  };
</script>

<style scoped>
  .header {
    align-items: center;
    border-bottom: 1px solid #ccc;
    cursor: pointer;
    display: flex;
    font-size: 20px;
    height: 35px;
    justify-content: flex-start;
    margin: 0;
    padding: 0 15px;
  }

  .header > .arrow {
    font-size: 0.8em;
  }

  .menu-panel {
    background: white;
    border-right: 1px solid #bbb;
    box-shadow: rgba(127, 127, 127, 0.5) 0 0 5px;
    display: flex;
    flex-direction: column;
    height: 100%;
    left: -50px;
    padding-left: 50px;
    position: absolute;
    top: 0;
    width: 65vw;
    z-index: 15;
  }

  section {
    display: flex;
    flex: 0;
    flex-direction: column;
    min-height: 35px;
    transition: flex-grow 0.35s ease;
  }

  .header, section.open > .content {
    border-bottom: 1px solid #ccc;
  }

  section > .content {
    display: flex;
    flex: 1;
    flex-direction: column;
    overflow: hidden;
  }

  section > .content > * {
    flex: 1;
  }

  section > .header .arrow {
    display: block;
    margin-left: 10px;
    transition: transform 0.2s ease;
  }

  section.open {
    flex-grow: 1;
  }

  section.open > .header .arrow {
    transform: rotate(90deg);
  }

  @media (max-width: 350px) {
    .menu-panel {
      width: 100vw;
    }
  }
</style>
