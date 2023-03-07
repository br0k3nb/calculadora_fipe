import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { AnoModel } from '../models/ano.model';
import { MarcaModel } from '../models/marca.model';
import { ModeloModel } from '../models/modelo.model';
import { ValorModel } from '../models/valor.model';

@Injectable({ providedIn: 'root' })
export class ApiService {
    constructor(private http: HttpClient) {}

    marcas(tipo: string) {
        return this.http.get<MarcaModel[]>(
            `https://parallelum.com.br/fipe/api/v1/${tipo}/marcas`
        );
    }

    modelos(tipo: string, marca: string | number) {
        return this.http.get<ModeloModel>(`
            https://parallelum.com.br/fipe/api/v1/${tipo}/marcas/${marca}/modelos`
        );
    }
    
    anos(tipo: string, marca: number, modelo: number) {
        return this.http.get<AnoModel>(
            `https://parallelum.com.br/fipe/api/v1/${tipo}/marcas/${marca}/modelos/${modelo}/anos`
        );
    }

    valor(tipo: string, marca: number, modelo: string, ano: string) {
        return this.http.get<ValorModel>(
            `https://parallelum.com.br/fipe/api/v1/${tipo}/marcas/${marca}/modelos/${modelo}/anos/${ano}`
        );
    }
}