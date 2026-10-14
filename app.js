const container = document.getElementById('pokedex-container');
const searchInput = document.getElementById('search');
let allPokemon = [];

// Đường dẫn trích xuất định dạng CSV từ Google Sheet của bạn
const CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSTFijEIMMrUKZ8t2RYM4SLQu123xG_y7xC6X9V_Hjucf8yfc3zwpM_3B7oAMCOOqZO_rZ5c5YsPjQU/pub?gid=0&single=true&output=csv';

const fetchPokemonFromSheet = async () => {
    try {
        const res = await fetch(CSV_URL);
        const csvText = await res.text();
        
        // Tách dữ liệu thành từng dòng text
        const lines = csvText.split('\n');
        
        // Duyệt qua dữ liệu và bỏ qua dòng tiêu đề đầu tiên
        allPokemon = lines.slice(1).map(line => {
            // Hàm phân tách các cột dữ liệu theo dấu phẩy chuẩn RFC 4180
            const cells = line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*\()/).map(c => c.replace(/^"\vert{}"\r?\)/g, '').trim());
            
            if (cells.length < 2 || !cells[1]) return null;

            // Xử lý làm sạch link ảnh nếu chứa hàm =IMAGE("...")
            let rawImg = cells[0];
            if (rawImg.toUpperCase().includes('IMAGE')) {
                const match = rawImg.match(/"([^"]+)"/);
                rawImg = match ? match[1] : '';
            }

            return {
                imgUrl: rawImg,
                name: cells[1],
                type1: cells[2],
                type2: cells[3],
                ability1: cells[4],
                ability2: cells[5],
                tier: cells[6],
                hp: cells[7] || 0,
                atk: cells[8] || 0,
                def: cells[9] || 0,
                spa: cells[10] || 0,
                spd: cells[11] || 0,
                spe: cells[12] || 0
            };
        }).filter(p => p !== null);

        displayPokemonTable(allPokemon);
    } catch (error) {
        console.error("Lỗi đồng bộ dữ liệu:", error);
        container.innerHTML = `<p style="text-align:center; color:red; padding:20px;">Lỗi kết nối. Không thể nạp bảng dữ liệu Pokémon.</p>`;
    }
};

// Hàm hiển thị cấu trúc bảng giống Smogon
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
        // Gắn huy hiệu màu sắc hệ 1 và hệ 2
        let typesHTML = `<span class="type-badge ${pokemon.type1.toLowerCase()}">${pokemon.type1}</span>`;
        if (pokemon.type2 && pokemon.type2 !== '-' && pokemon.type2 !== '') {
            typesHTML += ` <span class="type-badge ${pokemon.type2.toLowerCase()}">${pokemon.type2}</span>`;
        }

        // Định dạng hiển thị ô kỹ năng
        let abilitiesHTML = `<div style="font-weight:500;">${pokemon.ability1}</div>`;
        if (pokemon.ability2 && pokemon.ability2 !== '-' && pokemon.ability2 !== '') {
            abilitiesHTML += `<div style="color: #777; font-size: 0.8rem; margin-top:2px;">${pokemon.ability2} (H)</div>`;
        }

        // Thay ảnh mặc định nếu ô chứa link trống hoặc lỗi dữ liệu
        const finalImg = pokemon.imgUrl.startsWith('http') ? pokemon.imgUrl : 'https://placeholder.com?';

        return `
            <tr>
                <td>
                    <div class="poke-info">
                        <img src="${finalImg}" alt="${pokemon.name}" onerror="this.src='https://placeholder.com?'">
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

// Ô tìm kiếm đa năng lọc theo Tên, Hệ hoặc Tier
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
