export class ModeloModel {
    constructor(
        public modelos: [
            {
                nome: string,
                codigo: number
            }
        ],
        public anos: [
            {
                nome: string,
                codigo: string
            }
        ]
    ) {}
}