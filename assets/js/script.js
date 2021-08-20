// const Modal = {
//   open(){
//     document.querySelector('.modal-overlay').classList.add('-active')
//   },
//   close(){
//     document.querySelector('.modal-overlay').classList.remove('-active')
//   }
// }

const modal = () =>
  document.querySelector('.modal-overlay').classList.toggle('-active')

const Storage = {
  get() {
    return JSON.parse(localStorage.getItem('dev.finance:transactions')) || []
  },
  set(transactions) {
    localStorage.setItem(
      'dev.finance:transactions',
      JSON.stringify(transactions)
    )
  }
}

//calculo das transações
const Transaction = {
  all: Storage.get(),
  add(transaction) {
    Transaction.all.push(transaction)
    App.reload()
  },

  remove(index) {
    Transaction.all.splice(index, 1), App.reload()
  },

  incomes() {
    let income = 0
    Transaction.all.forEach(transaction => {
      if (transaction.amount > 0) {
        income += transaction.amount
      }
    })
    return income
  },

  expenses() {
    let expenses = 0
    Transaction.all.forEach(transaction => {
      if (transaction.amount < 0) {
        expenses += transaction.amount
      }
    })
    return expenses
  },

  total() {
    return Transaction.incomes() + Transaction.expenses()
  }
}

//ataliza o display
const updateBalances = () => {
  document.getElementById('incomeDisplay').innerHTML = Utils.formatCurrency(
    Transaction.incomes()
  )
  document.getElementById('expenseDisplay').innerHTML = Utils.formatCurrency(
    Transaction.expenses()
  )
  document.getElementById('totalDisplay').innerHTML = Utils.formatCurrency(
    Transaction.total()
  )
}

//cria a linha na tabela de novas transações
const HTMLTransactionRow = {
  transactionContainer: document.querySelector('.datatable-body'),

  addTransaction(transaction, index) {
    const tr = document.createElement('tr')
    tr.innerHTML = HTMLTransactionRow.innerHTMLTransaction(transaction, index)

    tr.dataset.index = index

    HTMLTransactionRow.transactionContainer.appendChild(tr)
  },

  innerHTMLTransaction(transaction, index) {
    const CSSClass =
      transaction.amount > 0 ? 'datatable-income' : 'datatable-expense'

    const amount = Utils.formatCurrency(transaction.amount)

    const html = `
      <td class="datatable-description">${transaction.description}</td>
      <td class="${CSSClass}">${amount}</td>
      <td class="datatable-date">${transaction.date}</td>
      <td class="datatable-icon">
        <img onclick="Transaction.remove(${index})" src="./assets/img/minus.svg" alt="Remover transação" />
      </td>
    `
    return html
  },

  clearTransaction() {
    this.transactionContainer.innerHTML = ''
  }
}

//formatação do dinheiro
const Utils = {
  formatCurrency(value) {
    const signal = Number(value) < 0 ? '-' : ''
    value = String(value).replace(/\D/g, '')
    value = Number(value) / 100
    value = value.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    })
    return signal + value
  },
  formatAmount(value) {
    // value = Number(value.replace(/\,?\.?/g, '')) * 100
    value = value * 100
    return Math.round(value)
  },
  formatDate(date) {
    const splittedDate = date.split('-')
    return `${splittedDate[2]}/${splittedDate[1]}/${splittedDate[0]}`
  }
}

const Form = {
  description: document.querySelector('input#description'),
  amount: document.querySelector('input#amount'),
  date: document.querySelector('input#date'),

  getValues() {
    return {
      description: Form.description.value,
      amount: Form.amount.value,
      date: Form.date.value
    }
  },
  validateField() {
    const { description, amount, date } = this.getValues()
    if (
      description.trim() === '' ||
      amount.trim() === '' ||
      date.trim() === ''
    ) {
      throw new Error('Preencha todos os campos!')
    }
  },
  formatValues() {
    let { description, amount, date } = this.getValues()
    amount = Utils.formatAmount(amount)
    date = Utils.formatDate(date)
    return {
      description,
      amount,
      date
    }
  },
  clearFields() {
    Form.description.value = ''
    Form.amount.value = ''
    Form.date.value = ''
  },

  submit(event) {
    event.preventDefault()
    try {
      Form.validateField()
      const transaction = Form.formatValues()
      Transaction.add(transaction)
      Form.clearFields()
      modal()
    } catch (err) {
      alert(err.message)
    }
  }
}

const App = {
  init() {
    HTMLTransactionRow.clearTransaction()
    // Transaction.all.forEach((transaction, index) => {
    //   HTMLTransactionRow.addTransaction(transaction, index)
    // })
    Transaction.all.forEach(HTMLTransactionRow.addTransaction)
    updateBalances()
    Storage.set(Transaction.all)
  },
  reload() {
    App.init()
  }
}

App.init()
