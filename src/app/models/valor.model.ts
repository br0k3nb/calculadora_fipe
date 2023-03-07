export class ValorModel {
    constructor(
        public Valor: string,
        public Marca: string,
        public Modelo: string,
        public AnoModelo: number | string,
        public Combustivel: string,
        public CodigoFipe: string,
        public MesReferencia: string,
        public TipoVeiculo: number,
        public SiglaCombustivel: string
    ){}
}