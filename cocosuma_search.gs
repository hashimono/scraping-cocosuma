/**
 * ココスマの新着物件 or 更新された物件情報をLINE通知する
 * 価格が更新された場合は更新前後の価格も出力する
 */

function main() {
  let searchUrl = 'https://matsumoto.fudousan.co.jp/lists/1/1/q?listtype=&area=&key=&ss=&sc=&k_l=700&k_h=1500&la_l=150&la_h=350&scode%5B1111%5D=%E4%BD%8F%E5%AE%85%E7%94%A8%E5%9C%9F%E5%9C%B0&a_t%5B%5D=%E6%9D%BE%E6%9C%AC%E5%B8%82&a_s%5B%5D=%E4%B8%AD%E5%A4%AE%E3%82%A8%E3%83%AA%E3%82%A2&a_s%5B%5D=%E5%8C%97%E6%9D%B1%E3%82%A8%E3%83%AA%E3%82%A2&a_s%5B%5D=%E5%9B%9B%E8%B3%80%E3%83%BB%E4%BC%9A%E7%94%B0%E3%82%A8%E3%83%AA%E3%82%A2&a_s%5B%5D=%E5%8D%97%E6%9D%BE%E6%9C%AC%E3%82%A8%E3%83%AA%E3%82%A2&a_s%5B%5D=%E5%8D%97%E6%9D%B1%E3%82%A8%E3%83%AA%E3%82%A2&a_s%5B%5D=%E8%A5%BF%E3%82%A8%E3%83%AA%E3%82%A2&a_s%5B%5D=%E6%A2%93%E5%B7%9D%E3%82%A8%E3%83%AA%E3%82%A2&a_s%5B%5D=%E6%B3%A2%E7%94%B0%E3%82%A8%E3%83%AA%E3%82%A2&a_s%5B%5D=%E5%AE%89%E6%9B%87%E3%83%BB%E5%A5%88%E5%B7%9D%E3%82%A8%E3%83%AA%E3%82%A2&dr=1&ev=1&rs=1000&s_a%5B%E4%B8%AD%E5%A4%AE%E3%82%A8%E3%83%AA%E3%82%A2%5D=%E4%B8%AD%E5%A4%AE%E3%82%A8%E3%83%AA%E3%82%A2&s_a%5B%E5%8C%97%E6%9D%B1%E3%82%A8%E3%83%AA%E3%82%A2%5D=%E5%8C%97%E6%9D%B1%E3%82%A8%E3%83%AA%E3%82%A2&s_a%5B%E5%8D%97%E6%9D%B1%E3%82%A8%E3%83%AA%E3%82%A2%5D=%E5%8D%97%E6%9D%B1%E3%82%A8%E3%83%AA%E3%82%A2&s_a%5B%E5%8D%97%E6%9D%BE%E6%9C%AC%E3%82%A8%E3%83%AA%E3%82%A2%5D=%E5%8D%97%E6%9D%BE%E6%9C%AC%E3%82%A8%E3%83%AA%E3%82%A2&s_a%5B%E5%9B%9B%E8%B3%80%E3%83%BB%E4%BC%9A%E7%94%B0%E3%82%A8%E3%83%AA%E3%82%A2%5D=%E5%9B%9B%E8%B3%80%E3%83%BB%E4%BC%9A%E7%94%B0%E3%82%A8%E3%83%AA%E3%82%A2&s_a%5B%E6%A2%93%E5%B7%9D%E3%82%A8%E3%83%AA%E3%82%A2%5D=%E6%A2%93%E5%B7%9D%E3%82%A8%E3%83%AA%E3%82%A2&s_a%5B%E8%A5%BF%E3%82%A8%E3%83%AA%E3%82%A2%5D=%E8%A5%BF%E3%82%A8%E3%83%AA%E3%82%A2&s_a%5B%E5%AE%89%E6%9B%87%E3%83%BB%E5%A5%88%E5%B7%9D%E3%82%A8%E3%83%AA%E3%82%A2%5D=%E5%AE%89%E6%9B%87%E3%83%BB%E5%A5%88%E5%B7%9D%E3%82%A8%E3%83%AA%E3%82%A2&s_a%5B%E6%B3%A2%E7%94%B0%E3%82%A8%E3%83%AA%E3%82%A2%5D=%E6%B3%A2%E7%94%B0%E3%82%A8%E3%83%AA%E3%82%A2';

  // スプレッドシートの情報を取得
  let fileId = PropertiesService.getScriptProperties().getProperty('DB_FILE_NAME');
  let sheetName = PropertiesService.getScriptProperties().getProperty('DB_SHEET_NAME');
  let spreadSheet = SpreadsheetApp.openById(fileId);
  let sheet = spreadSheet.getSheetByName(sheetName);
  let lastRow = sheet.getLastRow();

  // スクレイピング対象のページコンテンツ
  let content = UrlFetchApp.fetch(searchUrl).getContentText('utf-8');
  // 土地詳細ページのurl
  let currentLandLinks = Parser.data(content).from('<h2 class="reset title"><a href="').to('">').iterate();
  // 最終更新日
  let currentLastUpdatedDate = Parser.data(content).from('<small>最終更新日 ').to('</small>').iterate();
  // 価格
  let currentPrice = Parser.data(content).from('<span class="price"><span class="num">').to('</span>万円').iterate();

  // 最後の行から遡る形で、スプレッドシートに保存済みの土地情報を格納していく
  var savedRows = [];
  for(var i = 0; i <= lastRow; i++) {
    var targetRow = lastRow - i;
    if (targetRow < 1) {
      break;
    }
    let savedRow = {
      path: sheet.getRange('A' + targetRow).getValue(),
      lastUpdatedDate: sheet.getRange('B' + targetRow).getValue(),
      price: sheet.getRange('C' + targetRow).getValue()
    }
    savedRows.push(savedRow);
  }

  // 現在の最新ページから取得した土地情報をループ
  var newLnadUrls = [];
  var updatedLandUrls = [];
  var insertTargetRow = lastRow;

  for (var i = 0; i < currentLandLinks.length; i++) {
    const path = currentLandLinks[i].split('?')[0];

    // 保存済みでない(=新規)の土地情報を取得する
    if (savedRows.every((x) => x.path !== path)) {
      newLnadUrls.push(path);

      // スプレッドシートに新規物件データをインサートする
      insertTargetRow ++;
      let insertValue = [[path, currentLastUpdatedDate[i], currentPrice[i]]];
      sheet.getRange(insertTargetRow, 1, 1, 3).setValues(insertValue);

      continue;
    }

    // 最終更新日をチェックして、保存済みの日付から更新されていたら更新済みリストに格納する
    let currentDate = currentLastUpdatedDate[i];
    let savedDateIndex = savedRows.findIndex((x) => x.path === path);
    let savedDate = savedRows[savedDateIndex].lastUpdatedDate;
    if (currentDate !== savedDate) {
      var updatedValue = {
        path,
        price: ''
      }

      // 価格が変わってたらそのbefore&afterを出力する
      let price = currentPrice[i];
      let savedPrice = savedRows[savedDateIndex].price;
      if (Number(price) !== Number(savedPrice)) {
        updatedValue.price = `${savedPrice}万円 → ${price}万円`
      }

      updatedLandUrls.push(updatedValue);

      // スプレッドシートの最終更新日と価格を更新する
      let updateTargetRow = lastRow - savedDateIndex;
      let updateValue = [[path, currentDate, price]];
      sheet.getRange(updateTargetRow, 1, 1, 3).setValues(updateValue);
    }
  }

  // 新規物件か更新物件なければ終了
  if (newLnadUrls.length === 0 && updatedLandUrls.length === 0) {
    console.log('新規 or 更新物件なし')
    return;
  }

  // 新規物件情報をLINEに送信
  let totalCount = newLnadUrls.length + updatedLandUrls.length;
  console.log('新規:' + newLnadUrls.length + '件')
  console.log('更新:' + updatedLandUrls.length + '件')

  // 新規物件情報をLINEに送信
  newLnadUrls.forEach((url) => {
    let message = {
      type: 'text',
      text: '$\nhttps://matsumoto.fudousan.co.jp' + url,
      emojis: [
        {
          index: 0,
          productId: '5ac21a18040ab15980c9b43e',
          emojiId: '187'
        }
      ]
    }
    console.log(message);
    postLineMessage(message);
  })
  
  // 更新物件情報をLINEに送信
  updatedLandUrls.forEach((value) => {
    let message = {
      type: 'text',
      text: `$${value.price}\nhttps://matsumoto.fudousan.co.jp${value.path}`,
      emojis: [
        {
          index: 0,
          productId: '5ac21a18040ab15980c9b43e',
          emojiId: '182'
        }
      ]
    }
    console.log(message);
    postLineMessage(message);
  })

}

// LINEメッセージを送信する
function postLineMessage(messageObj) {
  // 送信処理を除外
  // return;

  var message = {
    messages: [
      messageObj
    ]
  };
  var data = {
    method: 'post',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + PropertiesService.getScriptProperties().getProperty('LINE_CHANNEL_ACCESS_TOKEN')
    },
    payload: JSON.stringify(message)
  };

  UrlFetchApp.fetch('https://api.line.me/v2/bot/message/broadcast', data);
}
