
document.addEventListener('DOMContentLoaded', () => {
    carregarLivros();
    carregarAlunos();

    document.querySelector('.modal-cover-add-cover').style.background = 'linear-gradient(135deg, #D4764A, #7A9B76)';
    document.querySelector('.modal-cover-add-cover').innerText = 'Capa do Livro';


    async function getLivroDetalhes(livroID) {
        try {
            const res = await fetch(`https://estante-jacomel-real.onrender.com/livros/${livroID}`);
            const data = await res.json();

            document.querySelector('.modal-cover').style.backgroundImage = `url(${data.capa})`;
            document.querySelector('.book-details h2').textContent = data.nomeLivro;
            document.querySelector('.book-details h3').textContent = data.autor;
            document.querySelector('.detail-section h4').textContent = data.sinopse;
            document.querySelector('.detail-section p').textContent = data.descricao;
            document.querySelector('#bookModal').style.animation = 'slideUp 0.3s ease-in-out forwards';
            document.querySelector('.emprestado-button').id = data.slugID;
            document.querySelector('.disponivel-button').id = data.slugID;
            document.querySelector('.remover-livro-button').id = data.slugID;

            if (data.status == 'disponível') {
                document.querySelector('.emprestado-button').style.display = 'block';
                document.querySelector('.disponivel-button').style.display = 'none';
            } else {
                document.querySelector('.emprestado-button').style.display = 'none';
                document.querySelector('.disponivel-button').style.display = 'block';
            }
            console.log(data.status);
        } catch (error) {
            console.log('>> [FRONTEND] Erro ao buscar livro:', error);
        }
    }

    async function carregarLivros() {
        try {
            const res = await fetch('https://estante-jacomel-real.onrender.com/livros');
            const data = await res.json();

            const addBook = document.createElement('div');
            addBook.classList.add('addBook');
            addBook.addEventListener('click', () => {
                document.querySelector('.addBookModal').style.animation = 'slideUp 0.3s ease-in-out forwards';
            });
            addBook.innerText = 'Adicionar Livro';
            document.querySelector('.books-grid').appendChild(addBook);

            data.forEach(livro => {
                const livroCard = document.createElement('div');
                livroCard.classList.add('book-card');
                livroCard.id = livro.slugID;
                livroCard.addEventListener('click', () => {
                    getLivroDetalhes(livro.slugID);
                });

                livroCard.innerHTML = `
                    <div class="book-cover">
                        <img src="${livro.capa}" alt="${livro.nomeLivro}">
                    </div>
                    <div class="book-info">
                        <h3 class="book-title">${livro.nomeLivro}</h3>
                        <p class="book-author">${livro.autor}</p>
                        <span class="book-status ${livro.status}">${livro.status}</span>
                    </div>
                `;
                document.querySelector('.books-grid').appendChild(livroCard);
            });
        } catch (error) {
            console.log('>> [FRONTEND] Erro ao carregar livros:', error);
        }
    }


    async function carregarAlunos() {
        try {
            const res = await fetch('https://estante-jacomel-real.onrender.com/carregarAlunos');
            const data = await res.json();


            data.forEach(aluno => {
                const alunoCard = document.createElement('tr');
                alunoCard.classList.add('aluno-card')
                alunoCard.id = aluno.nome;
                alunoCard.innerHTML = `
                    <td>${aluno.nome}</td>
                    <td>${aluno.livroID}</td>
                    <td>${aluno.turma}</td>
                    <td><button class="remove-aluno" id="${aluno.nome}">Remover aluno</button></td>
                `;
                document.querySelector('#requests-table').appendChild(alunoCard);
            });

            document.querySelectorAll('.remove-aluno').forEach(button => {
                button.addEventListener('click', () => {
                    removerAlunos(button.id);
                });
            });

        } catch (error) {
            console.log(`>> [FRONTEND] Erro ao carregar alunos:`, error);
        }
    }

    async function adicionarLivro(nomeLivro, autor, slugID, sinopse, descricao, capa) {
        try {
            const res = await fetch('https://estante-jacomel-real.onrender.com/adicionarLivro', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ nomeLivro, autor, slugID, sinopse, descricao, capa })
            });

            const data = await res.json();

            const livroCard = document.createElement('div');
            livroCard.classList.add('book-card');
            livroCard.id = slugID;
            livroCard.addEventListener('click', () => {
                getLivroDetalhes(slugID);
            });
            livroCard.innerHTML = `
                    <div class="book-cover" style="background-image: url('${capa}'); background-size: cover; background-position: center;">
                    </div>
                    <div class="book-info">
                        <h3 class="book-title">${nomeLivro}</h3>
                        <p class="book-author">${autor}</p>
                        <span class="book-status disponível">disponível</span>
                    </div>
                `;
            document.querySelector('.books-grid').appendChild(livroCard);

            document.querySelector('#nomeLivro').value = '';
            document.querySelector('#autor').value = '';
            document.querySelector('#slugID').value = '';
            document.querySelector('#sinopse').value = '';
            document.querySelector('#descricao').value = '';
            document.querySelector('#capa').value = '';
            document.querySelector('.online-search-btn2').innerText = 'Procurar livro online';
            document.querySelector('.modal-cover-add-cover').style.background = 'linear-gradient(135deg, #D4764A, #3E2723)';
            document.querySelector('.modal-cover-add-cover').innerText = 'Capa do Livro';
        } catch (error) {
            console.log(`>> [FRONTEND] Erro ao adicionar livro:`, error);
        }
    }

    async function emprestarLivro(slugID) {
        try {
            const res = await fetch('https://estante-jacomel-real.onrender.com/emprestarLivro', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ slugID })
            });

            const data = await res.json();

            if (data.status == 'ok200') {
                setTimeout(() => {
                    document.querySelector(`.emprestado-button`).style.display = 'none';
                    document.querySelector(`.disponivel-button`).style.display = 'block';
                    document.querySelector(`#${slugID} .book-status`).innerText = 'emprestado';
                    document.querySelector(`#${slugID} .book-status`).classList.remove('disponível');
                    document.querySelector(`#${slugID} .book-status`).classList.add('emprestado');
                }, 0);
            }
        } catch (error) {
            console.log(`>> [FRONTEND] Erro ao emprestar livro:`, error);
        }
    }

    async function disponivelLivro(slugID) {
        try {
            const res = await fetch('https://estante-jacomel-real.onrender.com/disponivelLivro', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ slugID })
            });

            const data = await res.json();

            if (data.status == 'ok200') {
                setTimeout(() => {
                    document.querySelector(`.emprestado-button`).style.display = 'block';
                    document.querySelector(`.disponivel-button`).style.display = 'none';
                    document.querySelector(`#${slugID} .book-status`).innerText = 'disponível';
                    document.querySelector(`#${slugID} .book-status`).classList.remove('emprestado');
                    document.querySelector(`#${slugID} .book-status`).classList.add('disponível');
                }, 0);
            }
        } catch (error) {
            console.log(`>> [FRONTEND] Erro ao disponibilizar livro:`, error);
        }
    }

    async function removerAlunos(alunoNome) {
        try {
            const req = await fetch('https://estante-jacomel-real.onrender.com/teste', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ alunoNome })
            });
            const data = await req.json();

            document.querySelector(`#${alunoNome}`).style.display = 'none';
        } catch (error) {
            console.log(`>> [FRONTEND] Erro ao remover aluno:`, error);

        }
    }


    // -- OPEN LIBRARY API --

    async function procurarOnline(nomeLivroOnlineEncoded) {
        try {
            const req = await fetch(`https://openlibrary.org/search.json?q=${nomeLivroOnlineEncoded}`);
            const data = await req.json();
            document.querySelector('.modal-cover-add-cover').style.background = 'none';
            document.querySelector('.modal-cover-add-cover').innerText = '';

            const livro = data.docs[0];

            if (data.docs.length > 0) {
                const titulo = livro.title;
                const autor = livro.author_name[0];
                const urlCapa = `https://covers.openlibrary.org/b/id/${livro.cover_i}-M.jpg`;

                document.querySelector('#nomeLivro').value = titulo;
                document.querySelector('#autor').value = autor;
                document.querySelector('#slugID').value = `a` + livro.cover_i;
                document.querySelector('#capa').value = urlCapa;
                document.querySelector('.verifyCapa').href = urlCapa;
                document.querySelector('.modal-cover-add-cover').style.background = `url("${urlCapa}")`;
                document.querySelector('.modal-cover-add-cover').innerText = '';

                document.querySelector('.online-search-modal').style.animation = 'slideDown 0.3s ease-in-out forwards';
                document.querySelector('.online-search-btn2').style = 'background: #D4764A; color: var(--deep-brown); pointer-events: all; transition: all 0.3s ease-in-out;';
                document.querySelector('.online-search-btn2').innerText = 'Procurar livro online';
                document.querySelector('#nomeLivroOnline').value = '';
                document.querySelector('.apis-button .google-books-btn').style = 'opacity: 0.5; transition: all 0.3s ease-in-out;';
                document.querySelector('.apis-button .open-library-btn').style = 'opacity: 0.5; transition: all 0.3s ease-in-out;';
            } else {
                document.querySelector('.online-search-btn2').style = 'background: #C44536; color: white; pointer-events: all; border: 2px solid #C44536;';
                document.querySelector('.online-search-btn2').innerText = 'Livro não encontrado';
            }

        } catch (error) {
            console.log(`>> [FRONTEND] Erro ao procurar livro online:`, error);

        }
    }

    // 

    async function procurarOnlineGoogle(titulo) {
        try {
            const res = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${titulo}&key=AIzaSyBZXxg8OihgyQUCyI23K_za3U5_eBjnlx0&langRestrict=pt`);
            const data = await res.json();
            console.log(data);
            document.querySelector('.modal-cover-add-cover').style.background = 'none';
            document.querySelector('.modal-cover-add-cover').innerText = '';

            // const livroInfo = data.items[0].volumeInfo;
            // const tituloLivro = livroInfo.title;
            // const autorLivro = livroInfo.authors[0];
            // const sinopseLivro = livroInfo.description;
            // const categoriaLivro = livroInfo.categories[0];
            // const capaLivro = livroInfo.imageLinks.thumbnail;


            if (!data.items[0].volumeInfo.title) {
                document.querySelector('#nomeLivro').value = 'Título não encontrado';
            } else {
                document.querySelector('#nomeLivro').value = data.items[0].volumeInfo.title;
            }

            if (data.items[0].volumeInfo.authors) {
                document.querySelector('#autor').value = data.items[0].volumeInfo.authors[0];
            } else {
                document.querySelector('#autor').value = 'Autor não encontrado';
            }

            if (!data.items[0].volumeInfo.description) {
                document.querySelector('#sinopse').value = 'Sinopse não encontrada';
            } else {
                document.querySelector('#sinopse').value = data.items[0].volumeInfo.description;
            }

            if (data.items[0].volumeInfo.categories) {
                document.querySelector('#descricao').value = data.items[0].volumeInfo.categories;
            } else {
                document.querySelector('#descricao').value = 'Categoria não encontrada';
            }

            if (data.items[0].volumeInfo.imageLinks) {
                document.querySelector('#capa').value = data.items[0].volumeInfo.imageLinks.thumbnail;
                document.querySelector('.verifyCapa').href = data.items[0].volumeInfo.imageLinks.thumbnail;
                document.querySelector('.modal-cover-add-cover').style.background = `url("${data.items[0].volumeInfo.imageLinks.thumbnail}")`;
                document.querySelector('.modal-cover-add-cover').innerText = '';
            } else {
                document.querySelector('#capa').value = 'Capa não encontrada';
                document.querySelector('.modal-cover-add-cover').style.background = 'linear-gradient(135deg, #D4764A, #7A9B76)';
                document.querySelector('.modal-cover-add-cover').innerText = 'Capa não encontrada';
                document.querySelector('.verifyCapa').href = '';
                document.querySelector('#slugID').value = 'ID não encontrado (capa)';

            }

            if (data.items[0].id) {
                document.querySelector('#slugID').value = `a` + data.items[0].id;
            } else {
                document.querySelector('#slugID').value = 'ID não encontrado';
            }

            // document.querySelector('#nomeLivro').value = data.items[0].volumeInfo.title;
            // document.querySelector('#autor').value = data.items[0].volumeInfo.authors[0];
            // document.querySelector('#slugID').value = `a` + data.items[0].id;
            // document.querySelector('#sinopse').value = data.items[0].volumeInfo.description;
            // document.querySelector('#descricao').value = data.items[0].volumeInfo.categories[0];
            // document.querySelector('#capa').value = data.items[0].volumeInfo.imageLinks.thumbnail;


            document.querySelector('.online-search-modal').style.animation = 'slideDown 0.3s ease-in-out forwards';
            document.querySelector('.online-search-btn2').style = 'background: #D4764A; color: var(--deep-brown); pointer-events: all; transition: all 0.3s ease-in-out;';
            document.querySelector('.online-search-btn2').innerText = 'Procurar livro online';
            document.querySelector('#nomeLivroOnline').value = '';
            document.querySelector('.apis-button .google-books-btn').style = 'opacity: 0.5; transition: all 0.3s ease-in-out;';
            document.querySelector('.apis-button .open-library-btn').style = 'opacity: 0.5; transition: all 0.3s ease-in-out;';

        } catch (error) {
            console.log(`>> [FRONTEND] Erro ao procurar livro online:`, error);
            document.querySelector('.modal-cover-add-cover').style.background = 'linear-gradient(135deg, #D4764A, #3E2723)';
            document.querySelector('.modal-cover-add-cover').innerText = 'Capa do Livro';
            document.querySelector('.online-search-btn2').style = 'background-color: var(--soft-terracota); color: var(--deep-brown); pointer-events: all;';
            document.querySelector('.online-search-btn2').innerText = 'Livro não encontrado';

        }
    }

    async function removerLivro(slugID) {
        try {
            const res = await fetch(`https://estante-jacomel-real.onrender.com/removerLivro/${slugID}`);

            const data = await res.json();

            if (data.status == 'ok200') {
                document.querySelector(`#${slugID}`).remove();
                document.querySelector('.modal').style.animation = 'slideDown 0.3s ease-in-out forwards';
            }
        } catch (error) {
            console.log(`>> [FRONTEND] Erro ao remover livro:`, error);
        }
    }

    document.querySelector('.modal-close').addEventListener('click', () => {
        document.querySelector('#bookModal').style.animation = 'slideDown 0.3s ease-in-out forwards';
    });

    document.querySelector('.search-box input').addEventListener('input', () => {
        const searchTerm = document.querySelector('.search-box input').value.toLowerCase();
        const livros = document.querySelectorAll('.book-card');
        livros.forEach(livro => {
            if (livro.innerText.toLowerCase().includes(searchTerm)) {
                livro.style.display = 'inline-block';
            } else {
                livro.style.display = 'none';
            }
        });
    });

    document.querySelector('.nav-link1').addEventListener('click', () => {
        document.querySelector('#student-page').style.display = 'block';
        document.querySelector('#admin-page').style.display = 'none';

        document.querySelector('#admin-page').style.animation = 'fadeInUp 0.3s ease-in-out forwards';

        document.querySelector('.nav-link1').style.color = '#D4764A';
        document.querySelector('.nav-link2').style.color = 'var(--warm-cream)';
    });

    document.querySelector('.nav-link2').addEventListener('click', () => {
        document.querySelector('#admin-page').style.display = 'block';
        document.querySelector('#student-page').style.display = 'none';

        document.querySelector('#student-page').style.animation = 'fadeInUp 0.3s ease-in-out forwards';

        document.querySelector('.nav-link2').style.color = '#D4764A';
        document.querySelector('.nav-link1').style.color = 'var(--warm-cream)';
    });

    document.querySelector('.nav-link1').style.color = '#D4764A';
    document.querySelector('.nav-link2').style.color = 'var(--warm-cream)';

    // document.querySelector('.addBook').addEventListener('click', () => {

    // });

    document.querySelector('.modal-close2').addEventListener('click', () => {
        document.querySelector('.addBookModal').style.animation = 'slideDown 0.3s ease-in-out forwards';
        document.querySelector('.addBookButton').style = 'background: #D4764A; color: #3E2723; pointer-events: all;';
        document.querySelector('.addBookButton').innerText = 'Adicionar Livro';
    });

    document.querySelector('.addBookButton').addEventListener('click', () => {
        const nomeLivro = document.querySelector('#nomeLivro').value;
        const autor = document.querySelector('#autor').value;
        const slugID = document.querySelector('#slugID').value.toLowerCase();
        const sinopse = document.querySelector('#sinopse').value;
        const descricao = document.querySelector('#descricao').value;
        const capa = document.querySelector('#capa').value;

        if (!nomeLivro || !autor || !slugID || !sinopse || !descricao || !capa) {
            alert('Preencha todos os campos');
        } else {
            document.querySelector('.addBookButton').innerText = 'Adicionando...';
            setTimeout(() => {
                adicionarLivro(nomeLivro, autor, slugID, sinopse, descricao, capa);
                document.querySelector('.addBookButton').innerText = 'Livro Adicionado';
                document.querySelector('.addBookButton').style = 'background-color: var(--sage-green); pointer-events: none;';
            }, 5000);
        }
    });

    document.querySelector('#nomeLivro').addEventListener('input', () => {
        const nomeLivro = document.querySelector('#nomeLivro').value;
        if (!nomeLivro) {
            document.querySelector('.modal-cover-add').innerText = 'Nome do livro';
        } else {
            document.querySelector('.modal-cover-add').innerText = nomeLivro;
        }
    });

    document.querySelector('.emprestado-button').addEventListener('click', (e) => {
        emprestarLivro(e.target.id);
    });
    document.querySelector('.disponivel-button').addEventListener('click', (e) => {
        disponivelLivro(e.target.id);
    });

    document.querySelector('.atualizarLista').addEventListener('click', () => {
        document.querySelector('.books-grid').innerHTML = '';
        carregarLivros();
    });

    document.querySelector('.atualizarAlunos').addEventListener('click', () => {
        document.querySelector('#requests-table').innerHTML = '';

        carregarAlunos();
    });

    document.querySelector('.online-search-btn').addEventListener('click', () => {
        document.querySelector('.online-search-modal').style.animation = 'slideUp 0.3s ease-in-out forwards';
    });

    document.querySelector('.modal-close3').addEventListener('click', () => {
        document.querySelector('.online-search-modal').style.animation = 'slideDown 0.3s ease-in-out forwards';
    });

    document.querySelector('.online-search-btn2').addEventListener('click', () => {
        const apiid = document.querySelector('.apis-button').id;
        if (!document.querySelector('#nomeLivroOnline').value || apiid === '') {
            alert('Preencha o campo de nome do livro ou selecione uma API');
        } else {
            document.querySelector('.online-search-btn2').innerText = 'Procurando...';
            document.querySelector('.online-search-btn2').style = 'background-color: var(--sage-green); pointer-events: none; border-color: var(--sage-green);';

            setTimeout(() => {
                const nomeLivroOnline = document.querySelector('#nomeLivroOnline').value;
                const nomeLivroOnlineEncoded = encodeURIComponent(nomeLivroOnline);
                if(document.querySelector('.apis-button').id === 'open-library-btn'){
                    procurarOnline(nomeLivroOnlineEncoded);
                    console.log('open-library-btn');
                }else{
                    procurarOnlineGoogle(nomeLivroOnlineEncoded);
                    console.log('google-books-btn');
                }
                console.log(nomeLivroOnlineEncoded);
            }, 5000);
        }
    });

    document.querySelector('#nomeLivroOnline').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            document.querySelector('.online-search-btn2').click();
        }
    });


    document.querySelector('#capa').addEventListener('input', () => {
        const urlValue = document.querySelector('#capa').value;

        document.querySelector('.modal-cover-add').style = `background: url("${urlValue}")`;
    });

    document.querySelector('#nomeLivroOnline').addEventListener('input', () => {
        document.querySelector('.online-search-btn2').style = 'background: #D4764A; color: white; pointer-events: all; border: 2px solid #D4764A;';
        document.querySelector('.online-search-btn2').innerText = 'Procurar livro online';
    });

    document.querySelector('.remover-livro-button').addEventListener('click', (e) => {
        const slugID = e.target.id;
        removerLivro(slugID);
    });

    document.querySelector('#open-library-btn').addEventListener('click', () => {
        document.querySelector('.apis-button').id = 'open-library-btn';
        
        setTimeout(() => {
            document.querySelector('.open-library-btn').style = 'background-color: #7A9B76; border-color: #7A9B76;';
            document.querySelector('.google-books-btn').style = 'opacity: 0.5;';
        }, 6);
        setTimeout(() => {
            document.querySelector('.apis-button').style = 'none';
        }, 10);
    });

    document.querySelector('#google-books-btn').addEventListener('click', () => {
        document.querySelector('.apis-button').id = 'google-books-btn';

        setTimeout(() => {
            document.querySelector('.google-books-btn').style = 'background-color: #7A9B76; border-color: #7A9B76;';
            document.querySelector('.open-library-btn').style = 'opacity: 0.5;';
        }, 6);
        setTimeout(() => {
            document.querySelector('.apis-button').style = 'none';
        },10)
    });
});