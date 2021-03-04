// Usando a tela de novas transacoes
const modal = {
    // abrindo e fechando a tela que adiciona uma despesa
    open(){
        document
            .querySelector(".modal-overlay")
            .classList
            .add('active')
            
    },
    close(){
        document
            .querySelector(".modal-overlay")
            .classList
            .remove('active')
    }   
}


// Guardando e pegando informacoes
const Storage = {
    // Pegando informacoes
    get() {
        // Transformando essa string em um array
        // JSON.parse: transfomra a string em um array
        // se nao achar tras um array vazio
        return JSON.parse(localStorage.getItem("dev.finances:transactions")) || []

    },

    // Guardar informacoes
    set(transactions) {
        // localStorage: banco local pra guardar as coisas
        // setItem: salvando o transactions com esse nome grande ai
        // JSON.stringfy: transformando em string o array
        localStorage.setItem("dev.finances:transactions", JSON.stringify(transactions))
    }
}


// Transacoes em geral
const Transaction = {

    // agrupando esse objeto aqui dentro, para quando apagar o mesmo ele ainda exista aqui dentro
    // despesas
    all: Storage.get(),

    add(transacition){
        Transaction.all.push(transacition)

        app.reload()
    },

    remove(index) {
        Transaction.all.splice(index, 1)

        app.reload()
    },

    incomes() {
        // somar entradas
        let income = 0;
        
        // arrow function: funcao anonima
        Transaction.all.forEach(transaction => {
            if(transaction.amount > 0) {
                income += transaction.amount;
            }
        })

        return income; 
    },

    expenses() {
        // somar saidas
        let expense = 0;
        
        Transaction.all.forEach(transaction => {
            if(transaction.amount < 0) {
                expense += transaction.amount;
            }
        })

        return expense;
    },

    total() {
        // entradas - saidas
        return Transaction.incomes() + Transaction.expenses()
    }
}


// Mexendo na DOM da pagina
const DOM = {
    // pegando o local no HTML do tbody
    transactionsContainer: document.querySelector('#data-table tbody'),

    // criando o TR e adicionando as despesas do transaction no tr
    addTransaction(transaction, index) {
        const tr = document.createElement('tr')
        tr.innerHTML = DOM.innerHTMLTransaction(transaction, index) 
        tr.dataset.index = index

        DOM.transactionsContainer.appendChild(tr)
        
    },

    innerHTMLTransaction(transaction, index) {

        // verificando se os valores sao positivos
        const CSSclass = transaction.amount > 0 ? "income" : "expense"

        const amount = Utils.formatCurrency(transaction.amount)

        // html para colocar no tr
        const html = `
            <td class="description">${transaction.description}</td>
            <td class="${CSSclass}">${amount}</td>
            <td class="date">${transaction.date}</td>
            <td>
                <img onclick="Transaction.remove(${index})" src="./assets/minus.svg" alt="Remover transação">
            </td>
            
        `

        return html
    },

    // Colocando os valores principais da saida entrada e total, enquanto ele recarrega quando tu coloca algo
    
    updateBalance() {
        document
            .getElementById('incomeDisplay')
            .innerHTML = Utils.formatCurrency(Transaction.incomes())
        document
            .getElementById('expenseDisplay')
            .innerHTML = Utils.formatCurrency(Transaction.expenses())
        document
            .getElementById('totalDisplay')
            .innerHTML = Utils.formatCurrency(Transaction.total())
    },

    clearTransaction() {
        DOM.transactionsContainer.innerHTML = ""
    }
}


// Funcoes uteis para utilizar
const Utils = {
    // Formatando os valores para ficarem mais bonitos ao salvar uma nova transacao
    formatAmount(value) {
        value = Number(value) * 100
        
        // arredondar o numero passado
        return Math.round(value)
    },

    formatDate(date) {
        // Separando a data
        const splittedDate = date.split("-")

        return `${splittedDate[2]}/${splittedDate[1]}/${splittedDate[0]}`
    },


    // fazendo os valores ficarem bonitos que nem valor de moeda
    formatCurrency(value) {

        // transformando o valor em um numero para fazer a validacao
        const signal = Number(value) < 0 ? "-" : ""
        
        // transformando em uma string e usando o replace pra trocar
        // g: fazer a repetição de troca pra todos, uma pesquisa global
        value = String(value).replace(/\D/g, "")
                                // //: expressão regular: muda o tratamento de texto de forma gigante
                                // \D: ache tudo tudo que não for caracter diferente, so numeros                
        
        value = Number(value) / 100
        
        // toLocaleString: ele muda uma string de forma bem mais detalhada e interessante
        value = value.toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL"
        })

        return signal + value            

    }
}


// Mexendo no formulario pra add uma despesa
const Form = {
    description: document.querySelector('input#description'),
    amount: document.querySelector('input#amount'),
    date: document.querySelector('input#date'),

    // Pegando os valores um por um
    getValues() {
        return {
            description: Form.description.value,
            amount: Form.amount.value,
            date: Form.date.value
        }
    },

    // Validando os campos
    validateField() {
        const { description, amount, date } = Form.getValues()

        if(description.trim() === "" || 
            amount.trim() === "" || 
            date.trim() === "" ) {
                throw new Error("Por favor, preencha todos os campos")
            }
        
    },

    // Formatando valores
    formatValues() {
        let { description, amount, date } = Form.getValues()

        amount = Utils.formatAmount(amount)

        date = Utils.formatDate(date)

        return {
            description,
            amount,
            date
        }
    },

    // Limpando os campos para o proximo save
    clearFields() {
        Form.description.value = ""
        Form.amount.value = ""
        Form.date.value = ""
    },

    // Adicionando a despesa ou entrada no painel
    submit(event) {   
        // Tirando o padrao do event     
        event.preventDefault()

        try {
            // verificar se tudo foi preenchido
           Form.validateField()

            // Formatar os dados
            const transaction = Form.formatValues()
            
            // Salvar e atualizar aplicacao
            Transaction.add(transaction)


            // Apagar os dados do formulario para add outro depois
            Form.clearFields()

            // Fechar o modal(a telinha)
            modal.close()

        } catch (error) {
            alert(error.message)
        }

        
    }
}


// Iniciando e atualizando o app
const app = {

    // adicionando as despesas no HTML
    init() {
        Transaction.all.forEach(DOM.addTransaction)


        DOM.updateBalance()

        Storage.set(Transaction.all)
    },
    // colocando outra despesa
    reload() {

        // limpando a dom antes de colocar ela de novo
        DOM.clearTransaction()

        // iniciando a dom de novo
        app.init()
    },
}


// iniciando aplicacao
app.init()