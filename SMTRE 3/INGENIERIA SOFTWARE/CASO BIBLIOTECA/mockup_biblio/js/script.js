let rolActual = null;

const configuracionRoles = {
    estudiante: {
        nombre: 'Estudiante Demo',
        rol: 'Estudiante',
        correo: 'estudiante@universidad.cl'
    },
    profesor: {
        nombre: 'Profesor Demo',
        rol: 'Profesor',
        correo: 'profesor@universidad.cl'
    },
    personal: {
        nombre: 'Personal Biblioteca',
        rol: 'Personal Biblioteca',
        correo: 'personal.biblio@universidad.cl'
    }
};

let usuariosData = [
    {
        rut: '19.876.543-2',
        nombre: 'Mariano Analista',
        rol: 'Estudiante',
        correo: 'm.analista@universidad.cl'
    },
    {
        rut: '15.123.456-7',
        nombre: 'Profesor Valdés',
        rol: 'Profesor',
        correo: 'p.valdes@universidad.cl'
    }
];

let librosGestionData = [
    {
        isbn: '978-1456',
        titulo: 'Ingeniería de Software',
        autor: 'Roger S. Pressman',
        categoria: 'Informática',
        estado: 'Disponible'
    },
    {
        isbn: '978-8448',
        titulo: 'Bases de Datos',
        autor: 'Abraham Silberschatz',
        categoria: 'Informática',
        estado: 'No Disponible'
    }
];

let editUsuarioIndex = null;
let editLibroIndex = null;
let reservasData = [];

function tienePermisoElemento(elemento, rol) {
    const rolesPermitidos = (elemento.dataset.roles || '').split(',').map((item) => item.trim()).filter(Boolean);
    if (rolesPermitidos.length === 0) {
        return true;
    }
    return rolesPermitidos.includes(rol);
}

function showSection(event, sectionId) {
    if (!rolActual) {
        return;
    }

    const sectionTarget = document.getElementById(sectionId);
    if (!sectionTarget || !tienePermisoElemento(sectionTarget, rolActual)) {
        return;
    }

    const sections = document.querySelectorAll('.content-section');
    sections.forEach(section => {
        section.style.display = 'none';
    });

    const links = document.querySelectorAll('.nav-links a');
    links.forEach(link => {
        link.classList.remove('active');
    });

    sectionTarget.style.display = 'block';

    if(event) {
        event.currentTarget.classList.add('active');
    } else {
        const autoLink = document.querySelector(`.nav-links a[data-section="${sectionId}"]`);
        if (autoLink) {
            autoLink.classList.add('active');
        }
    }
}

function actualizarPerfil(rol) {
    const data = configuracionRoles[rol];
    if (!data) {
        return;
    }

    const sidebarUserName = document.getElementById('sidebarUserName');
    const sidebarUserRole = document.getElementById('sidebarUserRole');
    const profileName = document.getElementById('profilePanelName');
    const profileRole = document.getElementById('profilePanelRole');
    const profileEmail = document.getElementById('profilePanelEmail');

    if (sidebarUserName) sidebarUserName.textContent = data.nombre;
    if (sidebarUserRole) sidebarUserRole.textContent = data.rol;
    if (profileName) profileName.textContent = data.nombre;
    if (profileRole) profileRole.textContent = data.rol;
    if (profileEmail) profileEmail.textContent = data.correo;
}

function aplicarPermisosRol(rol) {
    const navLinks = document.querySelectorAll('.nav-links a');
    navLinks.forEach((link) => {
        const permitido = tienePermisoElemento(link, rol);
        link.parentElement.style.display = permitido ? '' : 'none';
        link.classList.remove('active');
    });

    const secciones = document.querySelectorAll('.content-section');
    secciones.forEach((section) => {
        const permitido = tienePermisoElemento(section, rol);
        section.style.display = 'none';
        section.classList.toggle('blocked-section', !permitido);
    });
}

function iniciarSesion(rol) {
    if (!configuracionRoles[rol]) {
        return;
    }

    rolActual = rol;

    const roleGateway = document.getElementById('roleGateway');
    const dashboardContainer = document.getElementById('dashboardContainer');

    if (roleGateway) {
        roleGateway.style.display = 'none';
    }

    if (dashboardContainer) {
        dashboardContainer.classList.remove('is-hidden');
    }

    actualizarPerfil(rol);
    aplicarPermisosRol(rol);
    renderUsuariosTabla();
    renderLibrosTabla();
    renderReservasTabla();
    cancelarFormularioUsuario();
    cancelarFormularioLibro();
    showSection(null, 'catalogo');
}

function cerrarSesion() {
    rolActual = null;

    const roleGateway = document.getElementById('roleGateway');
    const dashboardContainer = document.getElementById('dashboardContainer');

    if (dashboardContainer) {
        dashboardContainer.classList.add('is-hidden');
    }

    if (roleGateway) {
        roleGateway.style.display = 'flex';
    }

    const navLinks = document.querySelectorAll('.nav-links a');
    navLinks.forEach((link) => {
        link.classList.remove('active');
    });

    cerrarTicketPrestamo();
    cerrarPanelPerfil();
}

function abrirPanelPerfil() {
    if (!rolActual) {
        return;
    }

    const modal = document.getElementById('profilePanelModal');
    if (modal) {
        modal.classList.add('active');
        modal.setAttribute('aria-hidden', 'false');
    }
}

function cerrarPanelPerfil() {
    const modal = document.getElementById('profilePanelModal');
    if (modal) {
        modal.classList.remove('active');
        modal.setAttribute('aria-hidden', 'true');
    }
}

function puedeGestionarUsuarios() {
    return rolActual === 'profesor' || rolActual === 'personal';
}

function puedeGestionarLibros() {
    return rolActual === 'personal';
}

function renderUsuariosTabla() {
    const tbody = document.getElementById('usersTableBody');
    if (!tbody) {
        return;
    }

    const puedeGestionar = puedeGestionarUsuarios();

    tbody.innerHTML = usuariosData.map((usuario, index) => {
        const acciones = puedeGestionar
            ? `<i class="fa-solid fa-pen-to-square icon-action action-usuarios" onclick="editarUsuario(${index})"></i>
               <i class="fa-solid fa-trash icon-action action-usuarios" style="color: red;" onclick="eliminarUsuario(${index})"></i>`
            : '<span class="text-muted">Sin permisos</span>';

        return `
            <tr>
                <td>${usuario.rut}</td>
                <td>${usuario.nombre}</td>
                <td>${usuario.rol}</td>
                <td>${usuario.correo}</td>
                <td>${acciones}</td>
            </tr>
        `;
    }).join('');

    const openUserFormButton = document.getElementById('openUserFormButton');
    if (openUserFormButton) {
        openUserFormButton.style.display = puedeGestionar ? '' : 'none';
    }
}

function renderLibrosTabla() {
    const tbody = document.getElementById('booksTableBody');
    if (!tbody) {
        return;
    }

    const puedeGestionar = puedeGestionarLibros();

    tbody.innerHTML = librosGestionData.map((libro, index) => {
        const badgeClass = libro.estado === 'Disponible' ? 'badge-success' : 'badge-danger';
        const acciones = puedeGestionar
            ? `<i class="fa-solid fa-pen-to-square icon-action action-libros" onclick="editarLibro(${index})"></i>
               <i class="fa-solid fa-trash icon-action action-libros" style="color: red;" onclick="eliminarLibro(${index})"></i>`
            : '<span class="text-muted">Sin permisos</span>';

        return `
            <tr>
                <td>${libro.isbn}</td>
                <td>${libro.titulo}</td>
                <td>${libro.autor}</td>
                <td>${libro.categoria}</td>
                <td><span class="badge ${badgeClass}">${libro.estado}</span></td>
                <td>${acciones}</td>
            </tr>
        `;
    }).join('');

    const openBookFormButton = document.getElementById('openBookFormButton');
    if (openBookFormButton) {
        openBookFormButton.style.display = puedeGestionar ? '' : 'none';
    }
}

function renderReservasTabla() {
    const tbody = document.getElementById('reservasTableBody');
    if (!tbody) {
        return;
    }

    if (reservasData.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="5" class="text-muted">Aún no hay reservas registradas.</td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = reservasData.map((reserva) => {
        return `
            <tr>
                <td>${reserva.fecha}</td>
                <td>${reserva.usuario}</td>
                <td>${reserva.rol}</td>
                <td>${reserva.libro}</td>
                <td>${reserva.isbn}</td>
            </tr>
        `;
    }).join('');
}

function sincronizarEstadoEnGestionLibros(libroCatalogo) {
    const index = librosGestionData.findIndex((libro) => libro.isbn === libroCatalogo.isbn);
    if (index >= 0) {
        librosGestionData[index].estado = 'No Disponible';
    } else {
        librosGestionData.push({
            isbn: libroCatalogo.isbn,
            titulo: libroCatalogo.titulo,
            autor: libroCatalogo.autor,
            categoria: libroCatalogo.categoria,
            estado: 'No Disponible'
        });
    }
    renderLibrosTabla();
}

function mostrarFormularioUsuario() {
    if (!puedeGestionarUsuarios()) {
        return;
    }

    const formCard = document.getElementById('userFormCard');
    const formTitle = document.getElementById('userFormTitle');
    if (formCard) {
        formCard.style.display = 'block';
    }
    if (formTitle) {
        formTitle.textContent = editUsuarioIndex === null ? 'Nuevo Usuario' : 'Editar Usuario';
    }
}

function cancelarFormularioUsuario() {
    editUsuarioIndex = null;

    const formCard = document.getElementById('userFormCard');
    const formTitle = document.getElementById('userFormTitle');
    const rutInput = document.getElementById('userRutInput');
    const nameInput = document.getElementById('userNameInput');
    const roleInput = document.getElementById('userRoleInput');
    const emailInput = document.getElementById('userEmailInput');
    const error = document.getElementById('userFormError');

    if (formCard) formCard.style.display = 'none';
    if (formTitle) formTitle.textContent = 'Nuevo Usuario';
    if (rutInput) rutInput.value = '';
    if (nameInput) nameInput.value = '';
    if (roleInput) roleInput.value = 'Estudiante';
    if (emailInput) emailInput.value = '';
    if (error) {
        error.style.display = 'none';
        error.textContent = '';
    }
}

function mostrarErrorFormularioUsuario(mensaje) {
    const error = document.getElementById('userFormError');
    if (!error) {
        return;
    }
    error.textContent = mensaje;
    error.style.display = 'block';
}

function guardarUsuario() {
    if (!puedeGestionarUsuarios()) {
        return;
    }

    const rut = (document.getElementById('userRutInput')?.value || '').trim();
    const nombre = (document.getElementById('userNameInput')?.value || '').trim();
    const rol = (document.getElementById('userRoleInput')?.value || '').trim();
    const correo = (document.getElementById('userEmailInput')?.value || '').trim();

    if (!rut || !nombre || !rol || !correo) {
        mostrarErrorFormularioUsuario('Completa todos los campos del usuario.');
        return;
    }

    const usuarioPayload = { rut, nombre, rol, correo };

    if (editUsuarioIndex === null) {
        usuariosData.push(usuarioPayload);
    } else {
        usuariosData[editUsuarioIndex] = usuarioPayload;
    }

    renderUsuariosTabla();
    cancelarFormularioUsuario();
}

function editarUsuario(index) {
    if (!puedeGestionarUsuarios() || !usuariosData[index]) {
        return;
    }

    const usuario = usuariosData[index];
    editUsuarioIndex = index;

    document.getElementById('userRutInput').value = usuario.rut;
    document.getElementById('userNameInput').value = usuario.nombre;
    document.getElementById('userRoleInput').value = usuario.rol;
    document.getElementById('userEmailInput').value = usuario.correo;

    mostrarFormularioUsuario();
}

function eliminarUsuario(index) {
    if (!puedeGestionarUsuarios() || !usuariosData[index]) {
        return;
    }

    usuariosData.splice(index, 1);
    renderUsuariosTabla();
    if (editUsuarioIndex === index) {
        cancelarFormularioUsuario();
    }
}

function mostrarFormularioLibro() {
    if (!puedeGestionarLibros()) {
        return;
    }

    const formCard = document.getElementById('bookFormCard');
    const formTitle = document.getElementById('bookFormTitle');
    if (formCard) {
        formCard.style.display = 'block';
    }
    if (formTitle) {
        formTitle.textContent = editLibroIndex === null ? 'Nuevo Libro' : 'Editar Libro';
    }
}

function cancelarFormularioLibro() {
    editLibroIndex = null;

    const formCard = document.getElementById('bookFormCard');
    const formTitle = document.getElementById('bookFormTitle');
    const isbnInput = document.getElementById('bookIsbnInput');
    const titleInput = document.getElementById('bookTitleInput');
    const authorInput = document.getElementById('bookAuthorInput');
    const categoryInput = document.getElementById('bookCategoryInput');
    const statusInput = document.getElementById('bookStatusInput');
    const error = document.getElementById('bookFormError');

    if (formCard) formCard.style.display = 'none';
    if (formTitle) formTitle.textContent = 'Nuevo Libro';
    if (isbnInput) isbnInput.value = '';
    if (titleInput) titleInput.value = '';
    if (authorInput) authorInput.value = '';
    if (categoryInput) categoryInput.value = '';
    if (statusInput) statusInput.value = 'Disponible';
    if (error) {
        error.style.display = 'none';
        error.textContent = '';
    }
}

function mostrarErrorFormularioLibro(mensaje) {
    const error = document.getElementById('bookFormError');
    if (!error) {
        return;
    }
    error.textContent = mensaje;
    error.style.display = 'block';
}

function guardarLibro() {
    if (!puedeGestionarLibros()) {
        return;
    }

    const isbn = (document.getElementById('bookIsbnInput')?.value || '').trim();
    const titulo = (document.getElementById('bookTitleInput')?.value || '').trim();
    const autor = (document.getElementById('bookAuthorInput')?.value || '').trim();
    const categoria = (document.getElementById('bookCategoryInput')?.value || '').trim();
    const estado = (document.getElementById('bookStatusInput')?.value || '').trim();

    if (!isbn || !titulo || !autor || !categoria || !estado) {
        mostrarErrorFormularioLibro('Completa todos los campos del libro.');
        return;
    }

    const libroPayload = { isbn, titulo, autor, categoria, estado };

    if (editLibroIndex === null) {
        librosGestionData.push(libroPayload);
    } else {
        librosGestionData[editLibroIndex] = libroPayload;
    }

    renderLibrosTabla();
    cancelarFormularioLibro();
}

function editarLibro(index) {
    if (!puedeGestionarLibros() || !librosGestionData[index]) {
        return;
    }

    const libro = librosGestionData[index];
    editLibroIndex = index;

    document.getElementById('bookIsbnInput').value = libro.isbn;
    document.getElementById('bookTitleInput').value = libro.titulo;
    document.getElementById('bookAuthorInput').value = libro.autor;
    document.getElementById('bookCategoryInput').value = libro.categoria;
    document.getElementById('bookStatusInput').value = libro.estado;

    mostrarFormularioLibro();
}

function eliminarLibro(index) {
    if (!puedeGestionarLibros() || !librosGestionData[index]) {
        return;
    }

    librosGestionData.splice(index, 1);
    renderLibrosTabla();
    if (editLibroIndex === index) {
        cancelarFormularioLibro();
    }
}

const catalogoLibros = [
    {
        titulo: 'Ingeniería de Software: Un Enfoque Práctico (9na Ed.)',
        autor: 'Roger S. Pressman',
        categoria: 'Ingeniería de Software',
        isbn: '978-1456287364',
        disponible: true
    },
    {
        titulo: 'Fundamentos y Diseño de Bases de Datos',
        autor: 'Abraham Silberschatz',
        categoria: 'Bases de Datos',
        isbn: '978-8448136545',
        disponible: false
    },
    {
        titulo: 'HTML, CSS y JavaScript para Principiantes',
        autor: 'Jon Duckett',
        categoria: 'Desarrollo Web',
        isbn: '978-1118907443',
        disponible: true
    },
    {
        titulo: 'Don Quijote de la Mancha',
        autor: 'Miguel de Cervantes',
        categoria: 'Literatura',
        isbn: '978-8420412148',
        disponible: true
    },
    {
        titulo: 'La Casa de los Espíritus',
        autor: 'Isabel Allende',
        categoria: 'Literatura',
        isbn: '978-8401353248',
        disponible: true
    },
    {
        titulo: 'Cien Años de Soledad',
        autor: 'Gabriel García Márquez',
        categoria: 'Literatura',
        isbn: '978-0307474728',
        disponible: false
    },
    {
        titulo: 'El Amor en los Tiempos del Cólera',
        autor: 'Gabriel García Márquez',
        categoria: 'Literatura',
        isbn: '978-0307389732',
        disponible: true
    },
    {
        titulo: 'Veinte Poemas de Amor y una Canción Desesperada',
        autor: 'Pablo Neruda',
        categoria: 'Poesía',
        isbn: '978-8437604949',
        disponible: true
    },
    {
        titulo: 'Residencia en la Tierra',
        autor: 'Pablo Neruda',
        categoria: 'Poesía',
        isbn: '978-9562846895',
        disponible: false
    },
    {
        titulo: 'Desolación',
        autor: 'Gabriela Mistral',
        categoria: 'Poesía',
        isbn: '978-9562846901',
        disponible: true
    },
    {
        titulo: 'Poema de Chile',
        autor: 'Gabriela Mistral',
        categoria: 'Poesía',
        isbn: '978-9561119020',
        disponible: true
    },
    {
        titulo: 'Poemas y Antipoemas',
        autor: 'Nicanor Parra',
        categoria: 'Poesía',
        isbn: '978-9562846383',
        disponible: true
    },
    {
        titulo: 'La Amortajada',
        autor: 'María Luisa Bombal',
        categoria: 'Literatura',
        isbn: '978-9561234567',
        disponible: false
    },
    {
        titulo: '2666',
        autor: 'Roberto Bolaño',
        categoria: 'Literatura',
        isbn: '978-8433974398',
        disponible: true
    },
    {
        titulo: 'Nocturno de Chile',
        autor: 'Roberto Bolaño',
        categoria: 'Literatura',
        isbn: '978-8433974404',
        disponible: true
    },
    {
        titulo: 'Gramática de la Lengua Castellana',
        autor: 'Andrés Bello',
        categoria: 'Lenguaje',
        isbn: '978-9561119037',
        disponible: true
    },
    {
        titulo: 'Manual de Redacción Académica',
        autor: 'María Teresa Serafini',
        categoria: 'Lenguaje',
        isbn: '978-6071608037',
        disponible: true
    },
    {
        titulo: 'Comunicación Oral y Escrita',
        autor: 'Paula Carlino',
        categoria: 'Lenguaje',
        isbn: '978-9876013280',
        disponible: false
    },
    {
        titulo: 'Redes de Computadores',
        autor: 'Andrew S. Tanenbaum',
        categoria: 'Redes',
        isbn: '978-6073223436',
        disponible: true
    },
    {
        titulo: 'Introducción a Algoritmos',
        autor: 'Thomas H. Cormen',
        categoria: 'Informática',
        isbn: '978-0262033848',
        disponible: true
    }
];

const categoryClassMap = {
    'Ingeniería de Software': 'blue-bg',
    'Bases de Datos': 'dark-bg',
    'Desarrollo Web': 'yellow-bg',
    'Literatura': 'green-bg',
    'Poesía': 'wine-bg',
    'Lenguaje': 'teal-bg',
    'Redes': 'gray-bg',
    'Informática': 'indigo-bg'
};

function getCategoryClass(categoria) {
    return categoryClassMap[categoria] || 'blue-bg';
}

function renderCatalogo(libros) {
    const cardsContainer = document.getElementById('catalogCards');
    const resultsCount = document.getElementById('resultsCount');

    if (!cardsContainer || !resultsCount) {
        return;
    }

    resultsCount.textContent = `Mostrando ${libros.length} resultado${libros.length === 1 ? '' : 's'}`;

    if (libros.length === 0) {
        cardsContainer.innerHTML = `
            <div class="no-results">
                <i class="fa-solid fa-circle-info"></i>
                <p>No encontramos libros con ese criterio. Intenta con otro título, autor o categoría.</p>
            </div>
        `;
        return;
    }

    cardsContainer.innerHTML = libros.map((libro) => {
        const badgeClass = libro.disponible ? 'badge-success' : 'badge-danger';
        const badgeText = libro.disponible ? 'Disponible' : 'No Disponible';
        const buttonText = libro.disponible ? 'Reservar' : 'No Disponible';
        const buttonState = libro.disponible ? '' : 'disabled';
        const buttonAction = libro.disponible ? `onclick="reservarLibro('${libro.isbn}')"` : '';

        return `
            <div class="resource-card">
                <div class="card-image ${getCategoryClass(libro.categoria)}">
                    <h3>${libro.categoria}</h3>
                </div>
                <div class="card-content">
                    <span class="badge ${badgeClass}">${badgeText}</span>
                    <h4>${libro.titulo}</h4>
                    <p class="author">${libro.autor}</p>
                    <p class="isbn">ISBN: ${libro.isbn}</p>
                </div>
                <div class="card-footer">
                    <button class="btn-outline" ${buttonState} ${buttonAction}>${buttonText}</button>
                    <i class="fa-regular fa-star icon-action"></i>
                </div>
            </div>
        `;
    }).join('');
}

function llenarCategorias() {
    const categoryFilter = document.getElementById('categoryFilter');

    if (!categoryFilter) {
        return;
    }

    const categorias = ['Todas', ...new Set(catalogoLibros.map((libro) => libro.categoria))];
    categoryFilter.innerHTML = categorias.map((categoria) => {
        const label = categoria === 'Todas' ? 'Todas las categorías' : categoria;
        return `<option value="${categoria}">${label}</option>`;
    }).join('');
}

function filtrarCatalogo() {
    const searchInput = document.getElementById('searchInput');
    const categoryFilter = document.getElementById('categoryFilter');

    if (!searchInput || !categoryFilter) {
        return;
    }

    const texto = searchInput.value.trim().toLowerCase();
    const categoria = categoryFilter.value;

    const librosFiltrados = catalogoLibros.filter((libro) => {
        const coincideCategoria = categoria === 'Todas' || libro.categoria === categoria;
        const coincideTexto =
            libro.titulo.toLowerCase().includes(texto) ||
            libro.autor.toLowerCase().includes(texto) ||
            libro.isbn.toLowerCase().includes(texto);

        return coincideCategoria && coincideTexto;
    });

    renderCatalogo(librosFiltrados);
}

function inicializarCatalogo() {
    const searchButton = document.getElementById('searchButton');
    const searchInput = document.getElementById('searchInput');
    const categoryFilter = document.getElementById('categoryFilter');

    llenarCategorias();
    renderCatalogo(catalogoLibros);

    if (searchButton) {
        searchButton.addEventListener('click', filtrarCatalogo);
    }

    if (searchInput) {
        searchInput.addEventListener('keydown', (event) => {
            if (event.key === 'Enter') {
                filtrarCatalogo();
            }
        });
    }

    if (categoryFilter) {
        categoryFilter.addEventListener('change', filtrarCatalogo);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    inicializarCatalogo();
    renderUsuariosTabla();
    renderLibrosTabla();
    renderReservasTabla();
});

function formatearFecha(fechaISO) {
    const fecha = new Date(fechaISO + 'T00:00:00');
    return fecha.toLocaleDateString('es-CL');
}

function generarCodigoPrestamo() {
    const numero = Math.floor(100000 + Math.random() * 900000);
    return `#PREST-${numero}`;
}

function limpiarErrorPrestamo() {
    const errorExistente = document.getElementById('loanFormError');
    if (errorExistente) {
        errorExistente.remove();
    }
}

function mostrarErrorPrestamo(mensaje) {
    limpiarErrorPrestamo();

    const formContainer = document.querySelector('#prestamos .form-container');
    if (!formContainer) {
        return;
    }

    const error = document.createElement('p');
    error.id = 'loanFormError';
    error.className = 'form-error';
    error.textContent = mensaje;
    formContainer.appendChild(error);
}

function registrarPrestamo() {
    const rutInput = document.getElementById('loanRut');
    const isbnInput = document.getElementById('loanIsbn');
    const returnDateInput = document.getElementById('loanReturnDate');

    if (!rutInput || !isbnInput || !returnDateInput) {
        return;
    }

    const rut = rutInput.value.trim();
    const isbn = isbnInput.value.trim();
    const returnDate = returnDateInput.value;

    if (!rut || !isbn || !returnDate) {
        mostrarErrorPrestamo('Completa RUT, ISBN y fecha de devolución para registrar el préstamo.');
        return;
    }

    limpiarErrorPrestamo();

    const now = new Date();
    const issueDate = now.toLocaleDateString('es-CL') + ' ' + now.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' });

    document.getElementById('ticketCode').textContent = generarCodigoPrestamo();
    document.getElementById('ticketRut').textContent = rut;
    document.getElementById('ticketIsbn').textContent = isbn;
    document.getElementById('ticketIssueDate').textContent = issueDate;
    document.getElementById('ticketReturnDate').textContent = formatearFecha(returnDate);

    const modal = document.getElementById('loanTicketModal');
    if (modal) {
        modal.classList.add('active');
        modal.setAttribute('aria-hidden', 'false');
    }
}

function cerrarTicketPrestamo() {
    const modal = document.getElementById('loanTicketModal');
    if (modal) {
        modal.classList.remove('active');
        modal.setAttribute('aria-hidden', 'true');
    }
}

function simularEscaneoIsbn() {
    const isbnInput = document.getElementById('loanIsbn');
    const scanStatus = document.getElementById('scanStatus');
    const scanButton = document.getElementById('scanIsbnButton');

    if (!isbnInput || !scanStatus || !scanButton) {
        return;
    }

    scanButton.disabled = true;
    scanStatus.classList.remove('success');
    scanStatus.classList.add('scanning');
    scanStatus.textContent = 'Escaneando código ISBN...';

    setTimeout(() => {
        const libroDetectado = catalogoLibros[Math.floor(Math.random() * catalogoLibros.length)];
        isbnInput.value = libroDetectado.isbn;

        scanStatus.classList.remove('scanning');
        scanStatus.classList.add('success');
        scanStatus.textContent = `ISBN detectado: ${libroDetectado.isbn} (${libroDetectado.titulo})`;

        scanButton.disabled = false;
    }, 1500);
}

document.addEventListener('click', (event) => {
    const loanModal = document.getElementById('loanTicketModal');
    const profileModal = document.getElementById('profilePanelModal');

    if (loanModal && event.target === loanModal) {
        cerrarTicketPrestamo();
    }

    if (profileModal && event.target === profileModal) {
        cerrarPanelPerfil();
    }
});

document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
        cerrarTicketPrestamo();
        cerrarPanelPerfil();
    }
});

function reservarLibro(isbn) {
    const libro = catalogoLibros.find((item) => item.isbn === isbn);
    if (!libro) {
        return;
    }

    if (!libro.disponible) {
        alert('Este libro ya no está disponible para reserva.');
        return;
    }

    libro.disponible = false;

    const usuario = configuracionRoles[rolActual] || { nombre: 'Usuario', rol: 'Sin rol' };
    reservasData.unshift({
        fecha: new Date().toLocaleString('es-CL', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }),
        usuario: usuario.nombre,
        rol: usuario.rol,
        libro: libro.titulo,
        isbn: libro.isbn
    });

    sincronizarEstadoEnGestionLibros(libro);
    filtrarCatalogo();
    renderReservasTabla();

    alert("¡Éxito! Reserva registrada para: " + libro.titulo + ".\nEl libro quedó como No Disponible.");
}

function simularAccion(mensaje) {
    alert(mensaje);
}