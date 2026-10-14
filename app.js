const container = document.getElementById('pokedex-container');
const searchInput = document.getElementById('search');
let allPokemon = [];

// Cấu hình ID và Tên Tab Sheet từ ảnh của bạn
const SHEET_ID = '1Pif5ZnukgSBEfVhDCXIaVc8m7PxxKtV8p7TVl7CA';
const SHEET_TITLE = 'Trang tính1';
const FULL_URL = `https://google.com{SHEET_ID}/gviz/tq?sheet=${SHEET_TITLE}`;

const fetchPokemonFromSheet = async () => {
    try {
        const res = await fetch(FULL_URL);
        const text = await res.text();
        
        // Cắt chuỗi để đưa về định dạng JSON chuẩn
        const jsonData = JSON.parse(text.substring(47, text.length - 2));
        const rows = jsonData.table.rows;

        allPokemon = rows.map((row, index) => {
            // Bỏ qua dòng tiêu đề đầu tiên (dòng 1)
            if (index === 0) return null;

            const cells = row.c;
            
            // Hàm đọc giá trị an toàn chống crash ứng dụng khi gặp ô trống
            const val = (idx, isNumber = false) => {
                if (cells && cells[idx] && cells[idx].v !== null && cells[idx].v !== undefined) {
                    return cells[idx].v;
                }
                return isNumber ? 0 : '';
            };

            // Hàm xử lý riêng cho cột Ảnh có chứa hàm =IMAGE("link")
            let imgLink = '';
            if (cells && cells[0]) {
                // Nếu Google Sheet trả về dạng object chứa thuộc tính f (formula)
                if (cells[0].f) {
                    const match = cells[0].f.match(/"([^"]+)"/);
                    imgLink = match ? match[1] : cells[0].v;
                } else {
                    imgLink = cells[0].v || '';
                }
            }

            return {
                imgUrl: imgLink,
                name: val(1),
                type1: val(2),
                type2: val(3),
                ability1: val(4),
                ability2: val(5),
                tier: val(6),
                hp: val(7, true),
                atk: val(8, true),
                def: val(9, true),
                spa: val(10, true),
                spd: val(11, true),
                spe: val(12, true)
            };
        }).filter(p => p !== null && p.name !== ''); // Lọc bỏ hàng tiêu đề và hàng trống

        displayPokemonTable(allPokemon);
    } catch (error) {
        console.error("Lỗi dữ liệu:", error);
        container.innerHTML = `<p style="text-align:center; color:red; padding:20px;">Lỗi: Không thể kết nối với Google Sheet. Vui lòng kiểm tra lại cấu hình nút 'Chia sẻ' công khai.</p>`;
    }
};

const displayPokemonTable = (pokemonList) => {
    if (pokemonList.length === 0) {
        container.innerHTML = '<p style="text-align:center; padding:20px;">Không tìm thấy Pokémon phù hợp.</p>';
        return;
    }

    let tableHTML = `
        <div class="table-container">
            <table>
                <thead>
                    <tr>
                        <th style="width: 22%;">Pokemon</th>
                        <th style="width: 14%;">Types</th>
                        <th style="width: 20%;">Abilities</th>
                        <th style="width: 8%; text-align:center;">Tier</th>
                        <th class="stat-cell">HP</th>
                        <th class="stat-cell">Atk</th>
                        <th class="stat-cell">Def</th>
                        <th class="stat-cell">SpA</th>
                        <th class="stat-cell">SpD</th>
                        <th class="stat-cell">Spe</th>
                    </tr>
                </thead>
                <tbody>
    `;

    tableHTML += pokemonList.map((pokemon) => {
        // Xử lý Huy hiệu hệ
        let typesHTML = `<span class="type-badge ${pokemon.type1.toLowerCase()}">${pokemon.type1}</span>`;
        if (pokemon.type2) {
            typesHTML += ` <span class="type-badge ${pokemon.type2.toLowerCase()}">${pokemon.type2}</span>`;
        }

        // Xử lý ô kỹ năng
        let abilitiesHTML = `<div style="font-weight:500;">${pokemon.ability1}</div>`;
        if (pokemon.ability2) {
            abilitiesHTML += `<div style="color: #777; font-size: 0.8rem; margin-top:2px;">${pokemon.ability2} (H)</div>`;
        }

        // Tạo link ảnh dự phòng nếu cột Image trong Sheet là text hoặc link lỗi
        const finalImg = pokemon.imgUrl.startsWith('http') ? pokemon.imgUrl : 'https://placeholder.com';

        return `
            <tr>
                <td>
                    <div class="poke-info">
                        <img src="${finalImg}" alt="${pokemon.name}" onerror="this.src='https://placeholder.com'">
                        <span style="text-transform: capitalize;">${pokemon.name}</span>
                    </div>
                </td>
                <td><div class="types-container">${typesHTML}</div></td>
                <td class="abilities-cell">${abilitiesHTML}</td>
                <td style="text-align: center; font-weight: bold; color: #444; font-size:0.85rem;">${pokemon.tier}</td>
                <td class="stat-cell">${pokemon.hp}</td>
                <td class="stat-cell">${pokemon.atk}</td>
                <td class="stat-cell">${pokemon.def}</td>
                <td class="stat-cell">${pokemon.spa}</td>
                <td class="stat-cell">${pokemon.spd}</td>
                <td class="stat-cell">${pokemon.spe}</td>
            </tr>
        `;
    }).join('');

    tableHTML += `</tbody></table></div>`;
    container.innerHTML = tableHTML;
};

// Tìm kiếm nâng cao
searchInput.addEventListener('input', (e) => {
    const value = e.target.value.toLowerCase().trim();
    const filtered = allPokemon.filter(p => 
        p.name.toLowerCase().includes(value) ||
        p.type1.toLowerCase().includes(value) ||
        p.type2.toLowerCase().includes(value) ||
        p.tier.toLowerCase() === value
    );
    displayPokemonTable(filtered);
});

fetchPokemonFromSheet();
