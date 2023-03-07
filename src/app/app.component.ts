import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ApiService } from './services/api.service';

import { AnoModel } from './models/ano.model';
import { MarcaModel } from './models/marca.model';
import { ModeloModel } from './models/modelo.model';
import { ValorModel } from './models/valor.model';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  formularioFipe!: FormGroup;

  marcas: MarcaModel[] = [];
  modelos!: ModeloModel['modelos'];
  anos: AnoModel[] = [];

  valoresAnteriores = {
    tipoAnterior: 'carros',
    marcaAnterior: '',
    modeloAnterior: '',
    anoAnterior: '',
    valorAnterior: ''
  }
  
  Math = Math; //Passando como propriedade para usar o método Math no HTML
  
  formularioFoiEnviado = false;
  carregandoDados = false; //Usando para exibir ou esconder spinners de carregamento

  valorPagoFormatado = '';
  dadosGerais!: ValorModel;
  porcentagemFipe!: number;

  constructor(private api: ApiService, private fb: FormBuilder) {}
  
  ngOnInit(): void {
    this.formularioFipe = this.fb.group({
      tipo: ['carros', Validators.required],
      marca: ['', Validators.required],
      modelo: ['', Validators.required],
      ano: ['', Validators.required],
      valor: ['', Validators.required]
    });

    this.api.marcas('carros').subscribe(todasAsMarcas => {
        this.marcas = todasAsMarcas;
      }
    ); // fazendo fetch initial para puxar os carros, já que carros são o valor padrão
    
    this.formularioFipe.valueChanges.subscribe(res => {
      const { tipo, marca, modelo, ano } = res;
      const { tipoAnterior, marcaAnterior, modeloAnterior, anoAnterior } = this.valoresAnteriores;
      
      if(!this.formularioFipe.valid) this.formularioFoiEnviado = false;

      this.carregandoDados = false;

      //Criando um bloco de condicionais para evitar requisições desnecessárias.
      //Apenas dados que sofreram alterações são levados em conta!

      if(tipo !== tipoAnterior) {
        this.valoresAnteriores.tipoAnterior = tipo;
        this.carregandoDados = true;

        this.api.marcas(tipo).subscribe(todasAsMarcas => { 
          this.formularioFipe.patchValue({
            marca: '',
            modelo: '',
            ano: '',
            valor: ''
          });

          this.marcas = todasAsMarcas;
        });
      }
      
      if(marca !== marcaAnterior && marca !== '') {
        this.valoresAnteriores.marcaAnterior = marca;
        this.carregandoDados = true;
    
        this.api.modelos(tipo, marca).subscribe(todosOsModelos => {
          this.formularioFipe.patchValue({
            modelo: '',
            ano: '',
            valor: ''
          });  

          this.modelos = todosOsModelos.modelos;
        });
      }

      if(modelo !== modeloAnterior && modelo !== '') {
        this.valoresAnteriores.modeloAnterior = modelo;
        this.carregandoDados = true;

        this.api.anos(tipo, marca, modelo).subscribe((todosOsAnos: any) => {
          this.formularioFipe.patchValue({
            ano: '',
            valor: ''
          }); 

          todosOsAnos.forEach((anos: AnoModel, index: number) => {
            //Trocando o nome '32000' por '0 KM'
            if(anos.nome === '32000') todosOsAnos[index].nome = '0 KM' 
          });

          this.anos = todosOsAnos;
        });
      }

      if(ano !== anoAnterior && ano !== '') {
        this.valoresAnteriores.anoAnterior = ano;
        this.carregandoDados = true;

        this.api.valor(tipo, marca, modelo, ano).subscribe(detalhesGerais => {
          this.formularioFipe.patchValue({
            valor: ''
          }); 

          const primeiraLetraDoMesMaiuscula = detalhesGerais.MesReferencia[0].toUpperCase() + detalhesGerais.MesReferencia.slice(1, detalhesGerais.MesReferencia.length);

          detalhesGerais.MesReferencia = primeiraLetraDoMesMaiuscula;
        
          this.dadosGerais = detalhesGerais;
        });
      }
    });
  }

  onSubmit() {
    this.formularioFoiEnviado = true;

    //formatando o valor pago
    const formatarValorPadraoBrasileiro = new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 2
    }); 

    this.valorPagoFormatado = formatarValorPadraoBrasileiro.format(this.formularioFipe.value.valor);
    
    const valorFipeString = this.dadosGerais.Valor;
    const valorComApenasNumeros = parseInt(valorFipeString.replace(/\D/g, "").slice(0, -2));
    const valorFormularioCompra = parseInt(this.formularioFipe.value.valor);
    
    const formulaDoCalculo = ((valorFormularioCompra - valorComApenasNumeros) / valorComApenasNumeros) * 100 + '' 
    
    if(this.dadosGerais.AnoModelo === 32000) this.dadosGerais.AnoModelo = '0 KM';
    //Passando o resultado do cálculo para um número com apenas 2 casas decimais
    this.porcentagemFipe = Number((-(formulaDoCalculo)).toFixed(2));
  }
}