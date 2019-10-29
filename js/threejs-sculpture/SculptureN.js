import * as THREE from 'three';

import {createPedestalEdges} from './create-pedestal-edges.js'

import {sculptToThreeJSMaterial, sculptToThreeJSMesh, glslToThreeJSMaterial, glslToThreeJSMesh} from 'sculpture-park-core';

export class Sculpture {
    constructor(isGlsl, source, msdfTexture) {
        this.IsGLSL = isGlsl;
        this.MSDFTexture = msdfTexture;
        this.source = source;
        if (isGlsl) {
            this.mesh = glslToThreeJSMesh(source);
        } else {
            this.mesh = sculptToThreeJSMesh(source);
        }
        this.uniforms = this.mesh.material.uniforms;
        const pedestalGeom = new THREE.BoxBufferGeometry(1.0, 0.5, 1.0);
        this.opacity = 0.0;
        this.stepSize = 0.8;
        const pedestalMat = new THREE.MeshBasicMaterial({ color: new THREE.Color(0.95, 0.95, 0.95), transparent: true, opacity: this.opacity });
        this.pedestal = new THREE.Mesh(pedestalGeom, pedestalMat);
        this.sepBuffer = 0.05; // Small gap between sculpture and pedestal prevents z-fighting
        this.pedestal.position.set(0, -.75-this.sepBuffer, 0);
        this.mesh.add(this.pedestal);
        this.pedestalEdges = createPedestalEdges(1.0, 0.5);
        this.pedestalEdges.position.set(0, -.75-this.sepBuffer, 0);
        this.mesh.add(this.pedestalEdges);
        this.selected = false;
        this.setOpacity(0.0);
    }

    setMSDFTexture(texture) {
        this.MSDFTexture = texture;
        this.refreshMaterial();
    }

    selectedSculpture(selected) {
        if(!this.pedestal.visible) {
            return;
        }
        this.mesh.remove(this.pedestalEdges);
        if (selected) {
            this.pedestalEdges = createPedestalEdges(1.0, 0.5, 0.015);
            this.pedestalEdges.position.set(0, -.75-this.sepBuffer, 0);
            this.mesh.add(this.pedestalEdges);
        } else {
            this.pedestalEdges = createPedestalEdges(1.0, 0.5);
			this.pedestalEdges.position.set(0, -.75-this.sepBuffer, 0);
            this.mesh.add(this.pedestalEdges);
        }
        this.selected = selected;
    }

    setOpacity(value) {
        this.opacity = value;
        this.mesh.visible = value !== 0.0;
        this.pedestal.material.opacity = this.opacity;
    }

    refreshMaterial(newSource) {
        if (newSource) {
            this.source = newSource;
        }
        if (this.IsGLSL) {
            this.mesh.material = glslToThreeJSMaterial(this.source);
        } else {
            this.mesh.material = sculptToThreeJSMaterial(this.source);
        }
        this.uniforms = this.mesh.material.uniforms;
    }

    update(uniforms) {
        this.mesh.material.uniforms['sculptureCenter'].value = this.mesh.position;
        this.mesh.material.uniforms['opacity'].value = this.opacity;
        this.mesh.material.uniforms['stepSize'].value = this.stepSize;
        this.mesh.material.uniforms['msdf'].value = this.MSDFTexture;
        uniforms.forEach(uniform => {
            if(uniform && uniform.name) {
                this.mesh.material.uniforms[uniform.name].value = uniform.value;
            }
        });
    }

}
