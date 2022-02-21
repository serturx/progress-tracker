<template>
  <v-app>
    <v-app-bar
      app
      color="purple"
      dark
    >
      <v-app-bar-title style="min-width: 100px">Resa Tracker</v-app-bar-title>
      <v-spacer/>
      <v-dialog v-model="addDialog" width="500">

        <template v-slot:activator="{on, attrs}">
          <v-btn
              v-on="on"
              v-bind="attrs"
              icon
          >
            <v-icon>
              mdi-plus
            </v-icon>
          </v-btn>
        </template>
        <v-card>
          <v-card-title>
            Neues Projekt hinzufügen
          </v-card-title>
          <v-card-text>
            <v-row>
              <v-col cols="12">
                <v-text-field v-model="name" label="Projektname"/>
              </v-col>
              <v-col cols="12">
                <v-menu
                    :close-on-content-click="false"
                    transition="scale-transition"
                    offset-y
                    min-width="auto"
                >
                  <template v-slot:activator="{ on, attrs }">
                    <v-text-field
                        v-model="date_picker_formatted"
                        label="Datum*"
                        prepend-inner-icon="mdi-calendar-range"
                        @blur="date_picker = parseDate(date_picker_formatted)"
                        v-bind="attrs"
                        v-on="on"
                    />
                  </template>
                  <v-date-picker
                      v-model="date_picker"
                      locale="de-de"
                      first-day-of-week="1"
                  />

                </v-menu>
              </v-col>
              <v-col cols="12" class="align-content-start">
                <div class="d-flex align-center">

                  <div class="mr-2">Farbe:</div>

                  <v-swatches
                      v-model="color"
                      :swatches="colors"
                      popover-y="bottom"
                      show-fallback
                      shapes="circles"
                      fallback-input-type="color"
                  />

                </div>

              </v-col>
            </v-row>
            <v-row style="min-height: 250px">

            </v-row>
          </v-card-text>
          <v-card-actions>
            <v-spacer/>
            <v-btn
                text
                color="secondary"
                @click="addDialog=false"
            >
              Abbrechen
            </v-btn>
            <v-btn
                color="success"
                @click="addProject"
            >
              Hinzufügen
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
      <v-dialog v-model="settingsDialog" width="500">

        <template v-slot:activator="{on, attrs}">
          <v-btn
              v-on="on"
              v-bind="attrs"
              icon
          >
            <v-icon>
              mdi-cog
            </v-icon>
          </v-btn>
        </template>
        <v-card>
          <v-card-title>
            Einstellungen
          </v-card-title>
          <v-card-text>
            <v-row>
              <v-col cols="12">
                <v-checkbox v-model="settings.showDaysDue" label="Zeige Tage bis Abgabe"/>
              </v-col>
              <v-col cols="12">
                <v-checkbox v-model="settings.showDue" label="Zeige Abgabe"/>
              </v-col>
            </v-row>
            <v-row style="min-height: 250px">

            </v-row>
          </v-card-text>
          <v-card-actions>
            <v-spacer/>
            <v-btn
                text
                color="secondary"
                @click="settingsDialog=false;saveToLocalStorage()"
            >
              Speichern
            </v-btn>

          </v-card-actions>
        </v-card>
      </v-dialog>
    </v-app-bar>

    <v-main>
      <v-container class="fill-height d-flex flex-column">

        <div
            v-for="entry in progress"
            :key="entry.name"
            style="height: 100px; width: 100%"
            class="d-flex flex-column"
        >
          <div><b>{{entry.name}}</b></div>
          <div class="d-flex flex-row align-center">
            <v-progress-linear
                :color="entry.color"
                height="30"
                :value="entry.value"
                rounded
                class="mr-2"
            >
              <strong>{{ Math.ceil(entry.value) }}%</strong>
            </v-progress-linear>
            <div class="mr-2">
              <v-btn color="success" height="30" max-width="30" @click="addProgress(entry.id)">
                <v-icon>mdi-plus</v-icon>
              </v-btn>

            </div>
            <div>
              <v-btn icon @click="removeProject(entry.id)"><v-icon>mdi-close</v-icon></v-btn>
            </div>
            <div class="text-no-wrap ml-4" v-if="settings.showDue">Abgabe: {{formatDate(entry.date)}}</div>
            <div style="width:fit-content" v-if="settings.showDaysDue" class="text-no-wrap ml-1">
              (in {{getDaysUntil(entry.date)}} Tagen)
            </div>

          </div>

        </div>

        <div>

        </div>
      </v-container>
    </v-main>
  </v-app>
</template>

<script>
import VSwatches from 'vue-swatches'
import 'vue-swatches/dist/vue-swatches.css'

export default {
  name: 'App',

  components: {
    VSwatches
  },
  data: () => ({
    addDialog: false,
    settingsDialog: false,
    name: "",
    color: "",
    date_picker: "",
    date_picker_formatted: "",
    progress: [{name:"12",color:"#222F3D",date:"2022-10-10",value:0}],
    settings: {showDue: true, showDaysDue: true},

    colors: [
      "#1FBC9C",
      "#1CA085",
      "#2ECC70",
      "#27AF60",
      "#3398DB",
      "#2980B9",
      "#A463BF",
      "#8E43AD",
      "#3D556E",
      "#222F3D",
      "#F2C511",
      "#F39C19",
      "#E84B3C",
      "#C0382B",
      "#DDE6E8",
      ""
    ],

  }),
  methods: {
    addProgress (entryid) {
      const entry = this.progress.find(e => e.id === entryid)
      if(entry.value <= 90) {
        entry.value += 10
      }

      if(entry.value === 100) {
        this.$confetti.start({
          particles: [
            {
              type: 'heart',
            }
          ]
        });
        const sound = new Audio(require('./assets/wow.mp3'))
        sound.play()
      }

      this.saveToLocalStorage()

      setTimeout(() => {
        this.$confetti.stop()
      }, 3500)


    },

    removeProject (entryid) {
      const index = this.progress.findIndex(e => e.id === entryid)
      this.progress.splice(index, 1)
      this.saveToLocalStorage()
    },

    saveToLocalStorage() {
      localStorage.setItem("progressData", JSON.stringify(this.progress))
      localStorage.setItem("progressSettings", JSON.stringify(this.settings))
    },

    loadFromLocalStorage() {
      this.progress = JSON.parse(localStorage.getItem("progressData"))
      if(this.progress === null) this.progress = []
      this.settings = JSON.parse(localStorage.getItem("progressSettings"))
      if(this.settings === null) this.settings = {showDue: true, showDaysDue: true}
    },

    addProject() {
      this.addDialog = false
      this.progress.push({name: this.name, color: this.color, date: this.date_picker, value: 0, id: Math.random().toString(16).slice(2)})
      this.saveToLocalStorage()
    },

    parseDate (date) {
      if (!date) return null

      const [day, month, year] = date.split('.')
      return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`
    },

    formatDate (date) {
      if (!date) return null

      const [year, month, day] = date.split('-')
      return `${day}.${month}.${year}`
    },

    getDaysUntil (date) {
      const d1 = new Date(date)
      const d2 = new Date()

      return Math.floor((d1 - d2) / (1000*60*60*24))
    },
  },

  watch: {
    date_picker: function () {
      this.date_picker_formatted = this.formatDate(this.date_picker)
    },
  },

  mounted() {
    this.loadFromLocalStorage()
  }
};
</script>
