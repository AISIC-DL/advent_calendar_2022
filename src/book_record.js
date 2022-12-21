//=============================================================================
//【ファイル名】
//    book_record.js
//【アプリ名】
//    書籍貸出記録
//-----------------------------------------------------------------------------
//  Copyright (c) 2022 AISIC.Inc
//=============================================================================

(() => {
  'use strict';

  kintone.events.on([
    'app.record.create.show', 'app.record.edit.show'
  ], async event => {
    const record = event.record;

    const sp_show_book_list = kintone.app.record.getSpaceElement('sp_show_book_list');
    const btn_show_book_list = new Kuc.Button({
      type: 'submit',
      text: '書籍リスト表示',
      id: 'btn_show_book_list',
      className: 'btn_show_book_list',
    });
    btn_show_book_list.addEventListener("click", async () => {
      try {

        // ------------------------------------
        // データ取得
        // ------------------------------------
        const bookRecords = await (new KintoneRestAPIClient({
          auth: { apiToken: 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx' }
        })).record.getAllRecords({
          app: 999,
          condition: '貸出状況 in ("未貸出")'
        }).then(resp => {
          console.log(resp);
          return resp;
        }).catch(error => {
          console.log(error);
          return Promise.reject(new Error('GET : 書籍マスタ / ' + error.message));
        });
        console.log(bookRecords);

        // ------------------------------------
        // Dialog > Contents 用
        // ------------------------------------
        const divContents = $('<div>').attr({ id: 'divContents' });

        const elmTable = $('<table>').addClass('tblContents');
        const elmHeader = $('<thead>');
        const elmBody = $('<tbody>');

        // Table Header
        elmHeader.append($('<tr>'));
        elmHeader.append($('<td>').addClass('th_chk').text('　'));
        elmHeader.append($('<td>').addClass('th_code').text('書籍コード'));
        elmHeader.append($('<td>').addClass('th_name').text('書籍名'));
        elmHeader.append($('<td>').addClass('th_author').text('著者'));

        // Table Body
        bookRecords.forEach(v => {
          const elmTr = $('<tr>');

          elmTr.append($('<td>').addClass('td_chk').append($('<input type="checkbox">').attr({ name: 'target', id: 'target_' + v.$id.value, value: v.書籍コード.value })));
          elmTr.append($('<td>').addClass('td_code').text(v.書籍コード.value));
          elmTr.append($('<td>').addClass('td_name').text(v.書籍名.value));
          elmTr.append($('<td>').addClass('td_author').text(v.著者.value));

          elmBody.append(elmTr);
        });
        divContents.append(elmTable.append(elmHeader).append(elmBody));

        // ------------------------------------
        // Dialog > Footer 用
        // ------------------------------------
        const divFooter = $('<div>').attr({ id: 'divFooter' });

        const btnOk = new Kuc.Button({
          type: 'submit',
          text: 'OK',
          id: 'btnOk',
          className: 'btnOk'
        });
        btnOk.addEventListener('click', event => {
          console.log('btnOk');
          console.log(event);

          const targets = [];

          // すべてのチェック済みvalue値を取得する
          $('input[name="target"]:checked').each(function () {
            targets.push($(this).val());
          });
          console.log(targets);

          // 値のセット
          const objRecord = kintone.app.record.get();
          const setTableValue = targets.map(v => {
            return {
              value: {
                書籍コード: { type: 'SINGLE_LINE_TEXT', value: v },
                書籍名: { type: 'SINGLE_LINE_TEXT', value: '' }
              }
            }
          });
          console.log(setTableValue);

          objRecord.record.貸出リスト.value = setTableValue;

          // ルックアップ自動取得
          objRecord.record.貸出リスト.value.forEach(v => v.value.書籍コード.lookup = 'UPDATE');

          kintone.app.record.set(objRecord);

          dialog.close();
        });
        divFooter.append(btnOk);

        divFooter.append($('<span>').text('　'));

        const btnCancel = new Kuc.Button({
          type: 'submit',
          text: 'Cancel',
          id: 'btnCancel',
          className: 'btnCancel'
        });
        btnCancel.addEventListener('click', event => {
          console.log('btnCancel');
          console.log(event);
          dialog.close();
        });
        divFooter.append(btnCancel);

        const dialog = new Kuc.Dialog({
          title: '書籍リスト',
          content: divContents.get(0),
          footer: divFooter.get(0),
          icon: ''
        });
        dialog.addEventListener('close', event => {
          console.log(event);
        });
        dialog.open();

      } catch (error) {
        console.log(error);
      };
    });
    sp_show_book_list.append(btn_show_book_list);

    return event;
  });

})();

