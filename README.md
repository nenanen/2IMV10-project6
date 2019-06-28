# City generator
![](http://jeroenvanhoof.nl/build/img/generation.png)



## Algorithm

The algorithms used in this project are based on the paper "Procedural Modeling of Cities" by Parish and Müller.
This paper contains algorithms based on L-systems for the generation of road networks as well as buildings. The road generation algorithm 
was however [criticized for being unnecessarily complex](http://nothings.org/gamedev/l_systems.html). 
For the road generation, we are therefore using the simplified version that is not based on L-systems.

## Setup

Install dependencies.
```bash
npm install
```

Compile the project.
```bash
npm run webpack
```

Start the server.
```
npm run start
```