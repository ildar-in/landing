


window.addEventListener('load', e => {
	var artefacts = createArtefacts(artefactsPlainText)
	console.log(artefacts)
  const descriptions = createDescriptions()
	console.log(descriptions)

	var choosen = 0
	const chooseMax = 11
	const width = 300
	const height = 100
	
	const descriptionDiv = document.createElement('div')
	descriptionDiv.style.position = 'absolute'
	descriptionDiv.style.backgroundColor = '#ddd'
	descriptionDiv.style.border = '1px solid #999'
	descriptionDiv.style.width = '400px'
	descriptionDiv.style.height = '200px'
	descriptionDiv.style.visibility = 'hidden'
	descriptionDiv.style.pointerEvents = 'none';
	descriptionDiv.hovers = []
	descriptionDiv.innerText = `Tags: Curse;
Враг с Проклятием получает на 1% больше урона за каждый стак от всех источников.
Максимум стаков: 100.`
	document.body.appendChild(descriptionDiv)

	const infoDiv = document.createElement('div')
	infoDiv.style.width = '95hw'
	infoDiv.style.height = '30px'
	infoDiv.innerText = 'Этаж: 1, Магазин. Выберете:'
	document.body.appendChild(infoDiv)

	const chooseDiv = document.createElement('div')
	chooseDiv.style.display = 'flex'
	chooseDiv.style.width = 3*2+3*width+'px'
	chooseDiv.style.height = 1*2+height+'px'
	chooseDiv.style.border = '1px solid #cc9'
	document.body.appendChild(chooseDiv)

	const info2Div = document.createElement('div')
	info2Div.style.width = '95hw'
	info2Div.style.height = '30px'
	info2Div.innerText = 'Экипированно'
	document.body.appendChild(info2Div)

	const equipedDiv = document.createElement('div')
	equipedDiv.style.width =  (2*3+ 3 * width)+'px'
	equipedDiv.style.height = (2*2+ 2 * height)+'px'
	equipedDiv.style.border = '1px solid #ccc'
	equipedDiv.style.display = 'flex'
	equipedDiv.style.flexDirection = 'row'
	equipedDiv.style.flexWrap = 'wrap'
	equipedDiv.style.alignContent = 'flex-start'
	document.body.appendChild(equipedDiv)

	const info3Div = document.createElement('div')
	info3Div.style.width = '95hw'
	info3Div.style.height = '35px'
	info3Div.innerText = 'Инвентарь'
	document.body.appendChild(info3Div)

	const inventoryDiv = document.createElement('div')
	inventoryDiv.style.width =  (2*3+ 3 * width)+'px'
	inventoryDiv.style.height = (2*3+ 3 * height)+'px'
	inventoryDiv.style.display = 'flex'
	inventoryDiv.style.border = '1px solid #ccc'
	inventoryDiv.style.flexDirection = 'row'
	inventoryDiv.style.flexWrap = 'wrap'
	inventoryDiv.style.alignContent = 'flex-start'
	document.body.appendChild(inventoryDiv)

	let stage = 1
	let room = 1
	const items = []
	showRandomArtefacts()
	function showRandomArtefacts() {
		infoDiv.innerText = 'Этаж: '+stage+', '+ (room==1?'Магазин':room==2?'Мини-босс':'Босс') +'. Выберете:'
		const chooseCount = room === 1? 1 : 3

		const itemsRandom = getRandomArtefacts(room, stage, artefacts, chooseCount)
		
		itemsRandom.sort((a, b) => a.rarity - b.rarity);
		itemsRandom.forEach(item => {
			artefacts = artefacts.filter(i => i !== item)
			const div = document.createElement('div')
			div.style.width = width+'px'
			div.style.height = height+'px'
			div.style.border = '1px solid black'
			div.style.cursor = 'pointer'
			div.style.fontSize = '14px'
			div.style.margin = '0'
			div.style.padding = '0'
			div.innerText = item.description

			switch(item.rarity){
				case 2: div.style.backgroundColor = '#bbf';break
				case 3: div.style.backgroundColor = '#fbf';break
				case 4: div.style.backgroundColor = '#fb9';break
			}
			item.div = div
			item.position = 0

			chooseDiv.appendChild(div)

			function click(e) {
				const equipedCount = items.filter(v=> v.position === 1).length
				switch (item.position)
				{
					case 0:
						if(equipedCount<6){
							item.position = 1
							equipedDiv.appendChild(e.target)
						} else {
							item.position = 2
							inventoryDiv.appendChild(e.target)
						}
						items.push(item)
						itemsRandom.forEach(i => {
							if (i !== item) {
								i.div.parentElement.removeChild(i.div)
							}
						})
						choosen++
						if(choosen<chooseMax){
							showRandomArtefacts()
						}
					break; case 1:
						equipedDiv.removeChild(item.div)
						inventoryDiv.appendChild(item.div)
						item.position = 2
					break; case 2:
						if(equipedCount<6){
							inventoryDiv.removeChild(item.div)
							equipedDiv.appendChild(item.div)
							item.position = 1
						}
					break;
				}
				info2Div.innerText = 'Экипированно (' + items.filter(v=>v.position===1).map(v=>v.id).join(';')+')'
				info3Div.innerText = 'Инвентарь (' + items.filter(v=>v.position===2).map(v=>v.id).join(';')+')'
			}
			div.addEventListener('click', click)

			div.addEventListener('mousemove', e => {
				descriptionDiv.style.left = e.pageX+50
				descriptionDiv.style.top = e.pageY-50
			})
			div.addEventListener('mouseenter', e=>{
				let idx = descriptionDiv.hovers.findIndex(v=>v===div)
				if(idx===-1){
					descriptionDiv.hovers.push(div)
				}
				descriptionDiv.style.visibility = 'visible'

				descriptionDiv.innerText = ''
				const arrayWithDuplicates = []
				item.tags.forEach(t=>{
				  const d = descriptions.find(v=>v.tags.findIndex(v=>v===t)!==-1)
					if(d){
						arrayWithDuplicates.push(d)
					}
				})
				const uniqueArray = [...new Set(arrayWithDuplicates)]
				uniqueArray.forEach(d=>descriptionDiv.innerText += d.text + '\n')
				descriptionDiv.style.visibility = descriptionDiv.innerText===''?'hidden':'visible'
			})
			div.addEventListener('mouseleave', e=>{
				let idx = descriptionDiv.hovers.findIndex(v=>v===div)
				descriptionDiv.hovers.splice(idx, 1)
				if(descriptionDiv.hovers.length===0){
					descriptionDiv.style.visibility = 'hidden'
				}
			})

		})
		room++
		if(room>=4){ 
			stage++
			room=1
		}
	}
})

function createDescriptions() {
	const descriptions = []
	var descs = tagsPlainText.split('Tags:')
	descs.splice(0, 1)
	descs.forEach(d=>{
		const lines = d.split('\n')
		const tags = lines[0].split(';').map(v=>v.replaceAll(' ', '')).filter(v=>v!=='')
		lines.splice(0,1)
		const text = lines.join('\n')
		const description = {
			tags,
			text
		}
		descriptions.push(description)
	})

	return descriptions
}

function getRandomArtefacts(room, stage, artefacts, chooseCount) {

	const dropRate = dropRateTable.find(v => v.room === room && v.stage === stage).dropRate
	const itemsRandom = []

	for(a=0;a<chooseCount;a++){

		const rnd = Math.random() * dropRate.reduce((a,v)=>a+v)
		let rarityMax = 0
		let rarityAcc = 0
		dropRate.forEach((d,i)=>{
			if(rnd > rarityAcc){ rarityMax = i }
			rarityAcc+=d
		})

		var finded = null
		const rarityMaxArtefacts = artefacts.filter(v=>v.rarity===rarityMax+1)
		if(rarityMaxArtefacts.length>0){
			finded = getRandomItemsFromArray(rarityMaxArtefacts, 1)[0]
		}

		while(finded === null){
			console.log('Not find rarity ' + rarityMax)
			rarityMax--
			finded = getRandomItemsFromArray(artefacts.filter(v=>v.rarity===rarityMax+1), 1)[0]
			break
		}

		artefacts = artefacts.filter(v => v !== finded)
		itemsRandom.push(finded)
	}
	
	return itemsRandom
}

function createArtefacts(sourceText){
	let artefacts = []
	var paragraphs = sourceText.split('ItemName')
	for(let i=0;i<paragraphs.length;i++){
		if(paragraphs[i]=='') {continue}
		const text = paragraphs[i]
		const lines = text.split('\n')
		const artefact = {
			id: i,
			rarity: Number(lines[1]),
			tags: lines[2].split(';').map(v=>v.replaceAll(' ', '')).filter(v=>v!==''),
			description:''
		}
		// const description = 
		artefact.description = lines.slice(3).join('\n')
		artefacts.push(artefact)
	}
	return artefacts
}

function getRandomItemsFromArray(arr, count) {
  // Create a shallow copy of the array to avoid modifying the original
  const shuffled = [...arr]; 
  let currentIndex = shuffled.length;
  let randomIndex;

  // While there remain elements to shuffle.
  while (currentIndex !== 0) {
    // Pick a remaining element.
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    // And swap it with the current element.
    [shuffled[currentIndex], shuffled[randomIndex]] = [
      shuffled[randomIndex],
      shuffled[currentIndex],
    ];
  }

  // Return the first 'count' elements of the shuffled array
  return shuffled.slice(0, count);
}

function removeFirstLines(text, times=1) {
	for(let i=0;i<times;i++){
		text=removeFirstLine(text)
	}
	return text
}
function removeFirstLine(text) {
  const lines = text.split('\n'); // Split the string by newline character
  lines.shift(); // Remove the first element (the first line)
  return lines.join('\n'); // Join the remaining lines back together
}
function arrayIntersect(arr1, arr2) {
  return arr1.filter(item => arr2.includes(item));
}

const dropRateTable = [
	{ stage:1, room:1, dropRate:[10,0,0,0] },
	{ stage:2, room:1, dropRate:[9,1,0,0] },
	{ stage:3, room:1, dropRate:[8,2,0,0] },
	{ stage:4, room:1, dropRate:[5,4,0,0] },

	{ stage:1, room:2, dropRate:[9,1,0,0] },
	{ stage:2, room:2, dropRate:[7,3,0,0] },
	{ stage:3, room:2, dropRate:[4,4,2,0] },
	{ stage:4, room:2, dropRate:[1,4,2,3] },

	{ stage:1, room:3, dropRate:[8,2,0,0] },
	{ stage:2, room:3, dropRate:[6,3,1,1] },
	{ stage:3, room:3, dropRate:[0,4,2,4] },
	{ stage:4, room:3, dropRate:[0,0,0,0] },
]

const upgrades=[
'+6% урона оружия',
'+4% скорость атаки оружия',
'+5% шанс крита',
'+10% критического урона',
'+3% общего урона',
'+10% урон эффектов',
'+2% шанс уклонения',
]

const artefactsPlainText =
`ItemName
1
Health;
Здоровье: 2/2
При получении урона наносит 500 урона всем противникам в области 500.
ItemName
2
Health;
Здоровье: 0/2
+15% Общий урон за каждое недостающее здоровье.
ItemName
1
Health;
Здоровье: 0/3
Общий урон: -15%
+20% получаемого опыта.
ItemName
2
Health;
Здоровье: 3/3
Общий урон: -30%
Общий урон +10% за каждую единицу здоровья.
ItemName
1
Health;
Здоровье: 2/3
Общий урон: -25%
+1 количество Снарядов.
ItemName
1
Health;
Здоровье: 1/3
Общий урон: -20%
+10% получаемого золота.
ItemName
1
Health; Summon; Orbital; 
Здоровье: 1/2
При получении урона создает 10 временных золотых знаков. Золотой знак дает 1 золото при поднятии.
ItemName
2
Health;
Здоровье: 1/1
При получении урона наносит всем врагам по 50 стаков Проклятия, Горения и Охлаждения на 5 секунд.
ItemName
1
Spell; Cast; Curse; Projectile;
Выстреливает проклятый снаряд, 450 урона, накладывает 25 Проклятия на 5 секунд.
Перезарядка: 4 сек.
ItemName
1
Spell; Cast; Burn; Projectile;
Выстреливает огненный шар, 100 урона, накладывает 25 Горения на 5 секунд.
Перезарядка: 2 сек.
ItemName
1
Spell; Chill; Projectile;
Выстреливает ледяной шип, 100 урона, накладывает 15 Охлаждения на 5 секунд.
Перезарядка: 2 сек.
ItemName
1
Spell; Aura; Curse; Area;
Аура каждую секунду наносит 50 урона врагам и накладывает 10 Проклятия на 5 секунд.
Область: 300.
ItemName
1
Spell; Aura; Chill; Area;
Аура каждую секунду наносит 25 урона врагам и накладывает 10 Охлаждения на 5 секунд.
Область: 300.
ItemName
1
Spell; Aura; Burn; Area;
Аура каждую секунду наносит 50 урона врагам и накладывает 10 Горения на 5 секунд.
Область: 300.
ItemName
1
Summon;
Призывает кусачий череп на 10 секунд.
Атака: 30 х 2/сек.
Перезарядка: 5 сек.
ItemName
1
Summon;  Defender;
Призывает Защитный
генератор барьера.
Здоровье: 5.
Размер: 50.
Перезарядка: 10 сек.
ItemName
1
OnHit; Burn;
При атаке накладывает 2 стака Горения на 3 секунды за каждые 5 ед. нанесенного атакой урона.
ItemName
1
OnHit; Chill;
При атаке накладывает 1 стак Охлаждения на 3 секунды за каждые 5 ед. нанесенного атакой урона.
ItemName
1
OnHit; Curse;
При атаке накладывает 1 стак Проклятия на 3 секунды за каждые 5 ед. нанесенного атакой урона.
ItemName
1
Summon;
Призывает автоматическую турель на 10 секунд.
Атака: 10 х 10/сек.
Перезарядка: 10 сек.
ItemName
1
OnHit; Alacrity;
При атаке получает 1 стак Рвения на 3 секунды.
ItemName
1
Summon;
Призывает телохранителя.
Телохранитель уничтожает ближайшие вражеские снаряды со скоростью 0.5/сек.
ItemName
1
Summon; Orbital;
Призывает Орбитальную 
циркулярную пилу.
Атака: 30 х 5/сек.
Размер: 100.
ItemName
1
OnHit; OnCrit; Chaining;
Критическая атака становится Цепной по 5 противникам.
Область: 500.
Шанс крита: +15%.
ItemName
1
Summon; Orbital; Defender;
Призывает Орбитальный 
щит, блокирующий вражеские снаряды.
Размер: 25.
ItemName
2
Burn; Attack;
Скорость Горения повышается на 150% от Скорости атаки.
ItemName
3
Burn; Attack;
При атаке наносит 1 ед. дополнительного урона за каждые 5 стаков Горения на противнике.
ItemName
4
Stacking; Burn;
Максимум стаков Горения: +200.
ItemName
2
Burn; Curse;
Скорость Горения повышается на 5% за каждый стак Проклятия на противнике.
ItemName
3
Burn; Curse;
При наложении 1 стака Проклятия 
накладывает 1 стак Горения.
Максимум стаков проклятия: +50
ItemName
4
Burn; Curse; Ability; BlackFlame;
При использовании Способности объединяет у всех противников 1 стак Горения и 1 стак Проклятия в 1 стак Черного Пламени.
ItemName
2
Health; OnHit;
Здоровье +2/2
Эффект получения урона срабатывает дважды.
ItemName
3
Health; Ability; 
СверхЛечение: накапливает 2 заряда. При использовании способности восстанавливает по 1 здоровью за 3 заряда, сохраняет остаток.
Зарядов: 0/12.
ItemName
4
OnHit; Invulnerability; Revenge;
При получении урона становится неуязвимым на 5 секунд. Получение урона в неуязвимости накапливает 1 стак Возмездия.
Перезарядка: 20 сек.
ItemName
1
Halo; Alacrity;
Ореол 10 раз в секунду даёт 1 стак Рвения на 5 секунд.
Область: 100
ItemName
2
Summon; Spell; Aura; Chill; 
Все Призванные получают Ауру холода. Она наносит 5 урона в секунду и 
5 Охлаждения на 5 секунд.
Область: 200.
ItemName
3
Summon; Chill;
Все призванные наносят дополнительно 5% урона за каждый стак Охлаждения на противнике.
ItemName
4
Summon; Chill; Convert; Freeze;
Призывает Ледяного Элементаля. При атаке  он конвертирует до 100 стаков Охлаждения 1 к 1 в Заморозку.
Атака: 300 х 1/сек.
ItemName
2
Effect; Burn; Curse; Chill; 
За каждый стак    Горения, Охлаждения 
или Проклятия увеличивает
 Урон Эффектов на 1%.
ItemName
3
Effect; Burn; Curse; Chill; 
Перезарядки и частота срабатывания эффектов происходит на 75% быстрее.
ItemName
4
Spell; Chaining;
Кастует Цепную Молнию на 10 противников. 
Урон: 900.
Область: 500
Перезарядка: 3 сек.
ItemName
2
Attack; Curse;
При атаке накладывает 2% от текущих стаков Проклятия за каждые 15 ед. нанесенного урона на 5 секунд. 
ItemName
3
Attack; Curse;
Проклятые враги получают дополнительно +2% урона от атак за каждый стак.
ItemName
4
Attack; Curse; Bane;
При атаке по проклятому врагу дается 1 стак Погибели за каждые 10 стаков Проклятия на цели.
ItemName
1
Health;
Здоровье: 0/1
При получении урона увеличивает Общий урон на 25% до конца боя.`

const tagsPlainText =
`Tags: Curse;
Враг с Проклятием получает на 1% больше урона за каждый стак от всех источников.
Максимум стаков: 100.
Tags: Burn
Горение наносит 1 урона в секунду за стак.
Максимум стаков: 100.
Tags: Chill
Враг с Охлаждением двигается и атакует на 1% медленнее за стак. На боссов и элитных врагов действует в 3 раза слабее. Максимум стаков: 100.
Tags: Projectile
Снаряды создаются атаками, способностями и заклинаниями.
Tags: Area
Размер влияет на размеры снарядов и областей.

Область и размеры считаются относительно максимального размера экрана: 1000. 
Tags: Cast;
Заклинаний наносят Урон Эффектом. Могут быть Огненными, Проклятыми, Морозными.
Tags:Summon; Defender
Призванными могут быть снаряды  особые объекты и персонажи.
Защитные объекты блокируют вражеские снаряды. 
Tags: AllDamage
Бонус к Общему урону действует на весь наносимый персонажем урон, включая способности и союзников.
Tags: Aura
Аура работает вокруг персонажа в области на всех вокруг.
Tags: Halo
Ореол работает, если в области рядом с есть противники или вражеские снаряды.
Tags: Alacrity
Рвение ускоряет атаку на 1% за каждый стак.
Максимум стаков: 100.
Tags: Chaining
Цепной эффект распространяется на ближайших к цели противников, применяя все особенности основного, по цепочке.
Tags: BlackFlame
Черное пламя никогда не гаснет.
Наносит 1% от максимального здоровья противника в виде урона в секунду за каждые 25 стаков.
Tags: Overheal
Если у персонажа полное здоровье, лечение вызывает эффект СверхЛечения.
Tags: Revenge
Возмездие тратит 5 стаков раз в 3 секунды и активирует эффект получения урона. Не активно во время неуязвимости.
Максимум стаков: 25.
Tags: Freeze
Заморозка останавливает противника, не давая ему двигаться и атаковать. Тратит 100 стаков в секунду.
Максимум стаков: 200.
Tags: EffectDamage
Уроном Эффектов считается любой урон, кроме атак.
Tags: Bane
Погибель увеличивает урон атаки на +2 ед. и скорость атаки на +0.25 атак в секунду за каждый стак.
Максимум стаков: 12.`