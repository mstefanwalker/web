sim = {

    hello: 'Welcome to plants!\n' +
        '\n' +
        '\n[controls]\n' +
        'sim.init()\n' +
        'sim.start()\n' +
        'sim.stop()\n' +
        'sim.step()\n' +
        '\n[yay!]\n' +
        'sim.plant()\n' +
        '\n' +
        '\n[parameters init]\n' +
        'sim.border\n' +
        'sim.density\n' +
        '\n[parameters sim]\n' +
        'sim.birth\n' +
        'sim.generations\n' +
        '\n[parameters display]\n' +
        'sim.color\n' +
        'sim.length\n' +
        'sim.width\n' +
        '\n' +
        '\n[also try]\n' +
        'sim.step(100)\n' +
        'sim.plant(2)\n' +
        '\n' +
        '\n(this is sim.hello)\n' +
        '\n',

    border: 0.2, // 0 to 0.5
    density: 0.0014, // plants per pixel
    birth: {min: 100, initialRange: 1000, range: 10000},
    generations: 6,
    color: '#8da',
    length: {pow: 0.8, scale: 0.2, generation: 0.8},
    width: {min: 2, pow: 0.4, scale: 0.2},

    stop: () => {},
    model: {},
    canvas: null,
    context: null,

    run: function() {
        console.log(sim.hello)
        sim.init()
        sim.start()
    },

    init: function() {
        // display
        sim.canvas = document.getElementById('simulation')
        sim.canvas.width = window.innerWidth
        sim.canvas.height = window.innerHeight
        sim.context = sim.canvas.getContext('2d')

        // model
        sim.model = {}
        sim.model.plants = []
        let numPlants = Math.ceil(window.innerWidth * sim.density)
        for (let i = 0; i < numPlants; i++) {
            sim.plant()
        }
    },

    start: function() {
        sim.stop()
        let simId = setInterval(() => {
            sim.step()
            sim.display()
        }, 40)
        let plantId = setInterval(() => {
            sim.plant()
        }, 5 * 60 * 1000)
        sim.stop = () => {
            window.clearInterval(simId)
            window.clearInterval(plantId)
        }
    },

    step: function(num = 1) {
        if (num !== 1) for (let i = 0; i < num-1; i++) sim.step(1)
        function birthAge() {
            return sim.birth.min + (Math.floor(Math.random() * sim.birth.range))
        }
        function agePart(part) {
            part.age++
            if (part.age === part.birthAge && part.generation <= sim.generations) {
                part.children = [
                    {
                        generation: part.generation+1,
                        angle: part.angle + Math.random(),
                        age: 0,
                        birthAge: birthAge(),
                        children: [] // [{angle, age, ...}, {...}, ...]
                    },
                    {
                        generation: part.generation+1,
                        angle: part.angle - Math.random(),
                        age: 0,
                        birthAge: birthAge(),
                        children: [] // [{angle, age, ...}, {...}, ...]
                    }
                ]
            }
            if (part.children.length === 0) return
            part.children.forEach(child => {
                agePart(child)
            })
        }
        sim.model.plants.forEach(plant => agePart(plant))
    },

    display: function() {
        function drawPart(part, start) {
            let angle = part.angle
            let age = part.age
            let generation = part.generation
            let length = Math.pow(age, sim.length.pow) * Math.pow(sim.length.generation, generation) * sim.length.scale
            let width = sim.width.min + Math.pow(age, sim.width.pow) * sim.width.scale
            let end = [
                start[0] + (Math.cos(angle) * length),
                start[1] + (Math.sin(angle) * length),
            ]
            sim.context.lineWidth = width
            sim.context.beginPath()
            sim.context.moveTo(start[0], start[1])
            sim.context.lineTo(end[0], end[1])
            sim.context.stroke()
            if (part.children.length === 0) return
            part.children.forEach(child => {
                drawPart(child, end)
            })
        }
        sim.context.clearRect(0, 0, sim.canvas.width, sim.canvas.height)
        sim.context.lineCap = 'round'
        sim.context.strokeStyle = sim.color
        sim.model.plants.forEach(plant => {
            drawPart(plant, plant.root)
        })
    },

    plant: function(num = 1) {
        if (num !== 1) for (let i = 0; i < num-1; i++) sim.plant(1)
        let angle = -Math.PI/2
        let left = sim.canvas.width * sim.border
        let range = sim.canvas.width - (sim.canvas.width * sim.border * 2)
        sim.model.plants.push({
            root: [
                left + Math.random() * range,
                sim.canvas.height
            ],
            generation: 0,
            angle: angle,
            age: 0,
            birthAge: sim.birth.min + (Math.floor(Math.random() * sim.birth.initialRange)),
            children: [] // [{angle, age, ...}, {...}, ...]
        })
    },
}

document.addEventListener('DOMContentLoaded', sim.run)
window.addEventListener('resize', sim.init)
