import * as THREE from 'three';

import {createPedestalEdges} from './create-pedestal-edges.js'
import {defaultFragSource, defaultVertexSource, fragFooter, sculptureStarterCode} from './default-shader.js'

export class Sculpture {
    constructor(fragmentShader = defaultFragSource) {
        this.vertexShader = defaultVertexSource;
        this.fragmentShader = fragmentShader;
        this.geometry = new THREE.BoxBufferGeometry(1.0, 1.0, 1.0);
        this.mesh = new THREE.Mesh(
            this.geometry,
            this.generateMaterial(defaultVertexSource, fragmentShader));
        const pedestalGeom = new THREE.BoxBufferGeometry(1.0, 0.5, 1.0);
        this.opacity = 0.0;
        this.stepSize = 0.8;
        const pedestalMat = new THREE.MeshBasicMaterial({ color: new THREE.Color(0.95, 0.95, 0.95), transparent: true, opacity: this.opacity });
        this.pedestal = new THREE.Mesh(pedestalGeom, pedestalMat);
        this.pedestal.position.set(0, -.75, 0);
        this.mesh.add(this.pedestal);
        this.pedestalEdges = createPedestalEdges(1.0, 0.5);
        this.pedestalEdges.position.set(0, -.75, 0);
        this.mesh.add(this.pedestalEdges);
        this.selected = false;
    }

    selectedSculpture(selected) {
        this.mesh.remove(this.pedestalEdges);
        if (selected) {
            this.pedestalEdges = createPedestalEdges(1.0, 0.5, 0.015);
            this.pedestalEdges.position.set(0, -.75, 0);
            this.mesh.add(this.pedestalEdges);
        } else {
            this.pedestalEdges = createPedestalEdges(1.0, 0.5);
			this.pedestalEdges.position.set(0, -.75, 0);
            this.mesh.add(this.pedestalEdges);
        }
        this.selected = selected;
    }

    setOpacity(value) {
        this.opacity = value;
        this.mesh.visible = value !== 0.0;
        this.pedestal.material.opacity = this.opacity;
    }

    generateMaterial(vertexShader, fragmentShader) {
      const material = new THREE.ShaderMaterial({
        uniforms: {
          time: {value: 0.0},
          mouse: {value: new THREE.Vector3(0.5,0.5,0.5)},
          opacity: {value: 1.0},
          sculptureCenter: {value: new THREE.Vector3()},
          stepSize: { value: 0.8 }
        },
        vertexShader,
        fragmentShader: sculptureStarterCode + fragmentShader + fragFooter,
        transparent: true
      });
      material.extensions.fragDepth = false;
      return material;
    }

    setShaderSource(fragmentShader) {
        this.fragmentShader = fragmentShader;
    }

    refreshMaterial() {
        this.mesh.material = this.generateMaterial(this.vertexShader, this.fragmentShader);
    }

    update(time) {
        this.mesh.material.uniforms['time'].value = time * 0.001;
        this.mesh.material.uniforms['sculptureCenter'].value = this.mesh.position;
        this.mesh.material.uniforms['opacity'].value = this.opacity;
        this.mesh.material.uniforms['stepSize'].value = this.stepSize;
    }

    // getShaderErrors(renderer) {
    //     let gl = renderer.context;
    //     let s = gl.createShader(gl.FRAGMENT_SHADER);
    //     const prefix = `
	// 	#extension GL_EXT_frag_depth : enable
	// 	precision highp float;
	// 	precision highp int;
	// 	uniform vec3 cameraPosition;
	// 	uniform mat4 viewMatrix;
	// 	` ;
    //     gl.shaderSource(s, prefix + this.fragmentShader);
    //     gl.compileShader(s);
    //     let log = gl.getShaderInfoLog(s);
    //     gl.deleteShader(s);
    //     if (log.length == 0) { return []; }
    //     let re = /ERROR:\s(\d+):(\d+):\s'(.*)'\s:\s(.*)/g;
    //     let errors = [];
    //     var res;
    //     while (res = re.exec(log)) {
    //         errors.push({
    //             line: parseInt(res[2]) - 7/*number of lines in prefix*/,
    //             item: res[3], message: res[4]
    //         });
    //     }
    //     return errors;
    // }

}

