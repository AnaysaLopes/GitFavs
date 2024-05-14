import { GithubUser } from "./GithubUser.js";

export class Favorites {
  constructor(root) {
    this.root = document.querySelector(root);
    this.load();
  }

  load() {
    this.entries = JSON.parse(localStorage.getItem('@github-favorites:')) || [];
  }

  save() {
    localStorage.setItem('@github-favorites:', JSON.stringify(this.entries));
  }

  async add(username) {
    try {
      const userExists = this.entries.find(entry => entry.login.toLowerCase() === username.toLowerCase());

      if (userExists) {
        throw new Error('Usuário já cadastrado');
      }

      const user = await GithubUser.search(username);

      if (!user.login) {
        throw new Error('Usuário não encontrado!');
      }

      this.entries = [user, ...this.entries];
      this.save();
      this.update();
    } catch (error) {
      alert(error.message);
    }
  }

  delete(user) {
    const filteredEntries = this.entries.filter(entry => entry.login !== user.login);
    this.entries = filteredEntries;
    this.update();
    this.save();
  }
}

export class FavoritesView extends Favorites {
  constructor(root) {
    super(root);

    this.tbody = this.root.querySelector('table tbody');

    this.update();
    this.onadd();
  }

  onadd() {
    const addButton = this.root.querySelector('.search button');
    addButton.onclick = () => {
      const { value } = this.root.querySelector('.search input');
      this.add(value);
    };
  }

  update() {
    this.removeAllTr();

    if (this.entries.length === 0) {
      const emptyMessageRow = document.createElement('tr');
      const emptyMessageCell = document.createElement('td');
      emptyMessageCell.colSpan = 4;
      emptyMessageCell.id = 'empty-message';

      emptyMessageCell.innerHTML = `
        <img src="./assets/Estrela.svg" alt="No users">
        <p>Não há nenhum usuário cadastrado.</p>
      `;

      emptyMessageRow.appendChild(emptyMessageCell);
      this.tbody.appendChild(emptyMessageRow);
    } else {
      this.entries.forEach(user => {
        const row = this.createRow();

        row.querySelector('.user img').src = `https://github.com/${user.login}.png`;
        row.querySelector('.user img').alt = `Imagem de ${user.name}`;
        row.querySelector('.user a').href = `https://github.com/${user.login}`;
        row.querySelector('.user p').textContent = user.name;
        row.querySelector('.user span').textContent = user.login;
        row.querySelector('.repositories').textContent = user.public_repos;
        row.querySelector('.followers').textContent = user.followers;

        row.querySelector('.delete').onclick = () => {
          const isOk = confirm('Tem certeza que deseja deletar essa linha?');
          if (isOk) {
            this.delete(user);
          }
        };

        this.tbody.append(row);
      });
    }
  }

  createRow() {
    const tr = document.createElement('tr');
    tr.classList.add('favorites');

    tr.innerHTML = `
      <td class="user">
        <img src="" alt="Imagem Perfil">
        <a href="#">
          <p></p>
          <span></span>
        </a>
      </td>
      <td class="repositories"></td>
      <td class="followers"></td>
      <td>
        <button class="delete">&times;</button>
      </td>
    `;

    return tr;
  }

  removeAllTr() {
    this.tbody.querySelectorAll('tr').forEach(tr => tr.remove());
  }
}
