const container = document.getElementById('pokedex-container');
const searchInput = document.getElementById('search');
let allPokemon = [];

// Thông tin bảng tính của bạn
const SHEET_ID = '1Pif5ZnukgSBEfVhDCXIaVc8m7PxxKtV8p7TVl7CA';
const SHEET_TITLE = 'Trang tính1';
// API xuất bảng tính dưới dạng tệp CSV để đọc dữ liệu chuẩn xác nhất
const FULL_URL = `https://google.com{SHEET_ID}/gviz/tq?tqx=out:csv&sheet=${SHEET_TITLE}`;

const fetchPokemonFromSheet = async () => {
    try {
        const res = await fetch(FULL_URL);
        const csvText = await res.text();
        
        // Tách dữ liệu theo từng hàng
        const lines = csvText.split('\n');
        
        // Duyệt qua từng hàng dữ liệu (bỏ qua hàng tiêu đề đầu tiên)
        allPokemon = lines.slice(1).map(line => {
            // Tách các cột dựa trên dấu phẩy (xử lý an toàn chuỗi nằm trong ngoặc kép)
            const cells = line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*\()/).map(c => c.replace(/^"\vert{}"\r?\)/g, '').trim());
            
            if (cells.length < 2 || !cells[1]) return null;

            // Xử lý trích xuất link ảnh sạch nếu ô Image chứa công thức =IMAGE("link")
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
        console.error("Lỗi đồng bộ hệ thống:", error);
        container.innerHTML = `<p style="text-align:center; color:red; padding:20px;">Lỗi kết nối. Không thể nạp bảng dữ liệu Pokémon.</p>`;
    }
};

// Hàm tạo bảng giao diện Smogon
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
        // Tạo nhãn màu cho Hệ 1 và Hệ 2
        let typesHTML = `<span class="type-badge ${pokemon.type1.toLowerCase()}">${pokemon.type1}</span>`;
        if (pokemon.type2 && pokemon.type2 !== '-' && pokemon.type2 !== '') {
            typesHTML += ` <span class="type-badge ${pokemon.type2.toLowerCase()}">${pokemon.type2}</span>`;
        }

        // Tạo danh sách hiển thị Kỹ năng chính và Kỹ năng ẩn
        let abilitiesHTML = `<div style="font-weight:500;">${pokemon.ability1}</div>`;
        if (pokemon.ability2 && pokemon.ability2 !== '-' && pokemon.ability2 !== '') {
            abilitiesHTML += `<div style="color: #777; font-size: 0.8rem; margin-top:2px;">${pokemon.ability2} (H)</div>`;
        }

        // Đường dẫn ảnh mặc định nếu link trong ô Excel bị lỗi
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

// Ô tìm kiếm đa năng theo Tên, Hệ hoặc Phân hạng Tier
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
