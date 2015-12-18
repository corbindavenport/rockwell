/*
This program is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.

This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.

You should have received a copy of the GNU General Public License along with this program. If not, see http://www.gnu.org/licenses/.
*/

$(document).ready(function(){

	if (document.addEventListener && window.localStorage) {
		console.log("Compatible web browser detected.");
	} else {
		$('#warning').openModal();
	}

	if (($.browser.mozilla) && ($.browser.version < "32.0") && (navigator.userAgent.indexOf("Mobile") > -1) && (localStorage.getItem("oldalert") != "completed")) {
		alert("You are running an older version of Firefox OS.\n\nRockwell may work, but it is designed for Firefox OS 2.0 and higher. Please update your device if possible.\n\nThis warning will not be shown again.");
		localStorage["oldalert"] = "completed";
	}

	if (localStorage.getItem("rockwell") != "2.0") {
		localStorage['rockwell'] = '2.0';
		$('#new').openModal();
	}

	// Actions for menu items

	$(".open-trigger").click(function() {
		$('#open').openModal();
	});

	$(".save-trigger").click(function() {
		$('#save').openModal();
	});

	$(".examples-trigger").click(function() {
		$('#examples').openModal();
	});

	$(".output-trigger").click(function() {
		$('#output').openModal();
	});

	$(".about-trigger").click(function() {
		$('#about').openModal();
	});

	// Autosave

	$("#code").on('change keyup paste', function() {
		localStorage["code"] = $('#code').val();
	});

	// File open/save functions

	$(document).on('click', ".export-confirm", function() {
		var txt = $('#code').val();
		var blob = new Blob([txt], {type: "text/plain;charset=utf-8"});
		Materialize.toast('Downloading file!', 3000, 'rounded');
		saveAs(blob, "rockwell-program.txt");
	});

	document.getElementById('importchooser').onchange = function(){
		var file = this.files[0];
		var reader = new FileReader();
		var format = file.name.split('.').pop().toLowerCase();
		reader.onload = function(progressEvent){
			$('#open').closeModal();
			var content = this.result;
			var tempdata = $('#code').val();
			$('#code').val(content);
			localStorage["code"] = $('#code').val();
			Materialize.toast('<span>Imported!</span> <a class="btn-flat yellow-text undo-clear" href="#">Undo<a>', 5000, 'rounded');
			$(".undo-clear").click(function() {
				$('#code').val(tempdata);
				localStorage["code"] = $('#code').val();
			});
		};
		reader.readAsText(file);
	};

	// Functionality for editor

	var agent = navigator.userAgent;

	$("#compileButton").click(function() {
		compileCode();
	});

	$("#runButton").click(function() {
		runBinary();
	});

	$("#resetButton").click(function() {
		reset();
	});

	$("#clearButton").click(function() {
		var tempdata = $('#code').val();
		$('#code').val("");
		Materialize.toast('<span>Editor cleared.</span> <a class="btn-flat yellow-text undo-clear" href="#">Undo<a>', 5000, 'rounded');
		$(".undo-clear").click(function() {
			$('#code').val(tempdata);
		});
	});

	$("#code").mouseover(function() {
		if ((($.browser.mobile) || (navigator.userAgent.indexOf("Mobile") > -1)) && ($(window).width() < 600))  {
			// Hide buttons and display, freeze emulation
			$('#compileButton').css('display', 'none');
			$('#runButton').css('display', 'none');
			$('#resetButton').css('display', 'none');
			$('#clearButton').css('display', 'none');
			$('#screen').css('display', 'none');
			$('#editor').css('top', '66px');
			$('#editor').css('bottom', '20px');
			codeRunning = false;
			Materialize.toast('Tap on "Rockwell" to go back.', 3000, 'rounded');
		};
	});

	$("#code").mouseout(function() {
		if (($.browser.mobile) || (navigator.userAgent.indexOf("Mobile") > -1))  {
			// Show buttons and display, continue emulation
			$('#compileButton').removeAttr("style");
			$('#runButton').removeAttr("style");
			$('#resetButton').removeAttr("style");
			$('#clearButton').removeAttr("style");
			$('#screen').removeAttr("style");
			$('#editor').removeAttr("style");
			$('#editor').removeAttr("style");
			codeRunning = true;
		};
	});

	// Fix for sidebar not closing on item select

	$('a').sideNav('hide');

	// Examples functions

	function example(text) {
		var tempdata = $('#code').val();
		$('#code').val(text);
		localStorage["code"] = text;
		Materialize.toast('<span>Example opened.</span> <a class="btn-flat yellow-text undo-clear" href="#">Undo<a>', 5000, 'rounded');
		$(".undo-clear").click(function() {
			$('#code').val(tempdata);
			localStorage["code"] = tempdata;
		});
	}

	$('body').on('click', '#exampleAlive', function() {
		example("start:\n lda #15\n sta $0 ;xpos\n sta $1 ;ypos\n\nloop:\n lda $fe\n and #3\n cmp #0\n beq go_left\n cmp #1\n beq go_right\n cmp #2\n beq go_down\n dec $1\ndraw:\n lda $1\n and #$1f\n asl\n tax\n lda ypos,x\n sta $2\n inx\n lda ypos,x\n sta $3\n lda $0\n and #$1f\n tay\n lda ($2),y\n tax\n inx\n txa\n sta ($2),y\n jmp loop\ngo_down:\n inc $1\n jmp draw\ngo_left:\n dec $0\n jmp draw\ngo_right:\n inc $0\n jmp draw\n\nypos:\n dcb $00,$02,$20,$02,$40,$02,$60,$02\n dcb $80,$02,$a0,$02,$c0,$02,$e0,$02\n dcb $00,$03,$20,$03,$40,$03,$60,$03\n dcb $80,$03,$a0,$03,$c0,$03,$e0,$03\n dcb $00,$04,$20,$04,$40,$04,$60,$04\n dcb $80,$04,$a0,$04,$c0,$04,$e0,$04\n dcb $00,$05,$20,$05,$40,$05,$60,$05\n dcb $80,$05,$a0,$05,$c0,$05,$e0,$05");
	});

	$('body').on('click', '#exampleBackAndForth', function() {
		example("start:\n  lda #$f\n  sta $0               ; Xpos = 15\n  lda #$4\n  sta $1               ; Ypos = $02(0f) (top line)\n  lda #$01\n  sta $2               ; direction (0=left, 1=right)\n\nmainloop:\n  lda $00              ; load Xpos\n  sta $03              ; save it..\n  lda $01              ; load Ypos\n  sta $04              ; save it..\n\n  lda $02              ; check direction\n  cmp #$00             ; left?\n  bne notLeft\n  inc $0               ; increment X\n  jmp checkBounce\nnotLeft:\n  dec $0               ; decrement X\n\ncheckBounce:\n  ldx $02              ; regX = direction\n  lda $0               ; load xpos\n  cmp #$1f             ; at-most right?\n  bne notBounceLeft\n  ldx #$1              ; go left\n  jmp draw             ; draw dot\nnotBounceLeft:\n  cmp #$0              ; at-most right?\n  bne draw\n  ldx #$0              ; go right\ndraw:\n  stx $02              ; update direction\n\n  lda #$1              ; A=1 white color\n  ldx #$0\n  sta ($0,x)           ; draw dot\n\n  lda #$0              ; A=0 black color\n  ldx #$0\n  sta ($3,x)           ; erase previous dot\n\n  jmp mainloop         ; continue forever");
	});

	$('body').on('click', '#exampleAtari', function() {
		example("start:\n  lda #<logo\n  sta $0\n  lda #>logo\n  sta $1\n  lda #$00\n  sta $2\n  lda #$02\n  sta $3\n\ndecrunchLoop:\n  lda $3\n  cmp #$6\n  bne moreWork \n  rts\nmoreWork:\n  ldy #0\n  lda ($0),y\n  cmp #$ff\n  bne notCrunched\n  iny\n  lda ($0),y ; repeat #\n  sta $4\n  iny\n  lda ($0),y ; color\n  ldy $4\ndrawLoop:\n  ldx #0\n  sta ($2,x)\n  jsr nextPixel\n  dey\n  bne drawLoop\n  jsr getNextByte\n  jsr getNextByte\n  jmp decrunchLoop\nnotCrunched:\n  ldx #0\n  sta ($2,x)\n  jsr nextPixel\n  jsr getNextByte\n  jmp decrunchLoop\n\ngetNextByte:\n  inc $0\n  lda $0\n  cmp #$00\n  bne notHi\n  inc $1\nnotHi:\n  rts\n\nnextPixel:\n  inc $2\n  ldx $2\n  cpx #$00\n  bne notNextLine\n  inc $3\nnotNextLine:\n  rts\n\n\nlogo:\n dcb $ff,43,1,$f,$f,$f,$c,$f,$f,$f,$ff,24,1,$c,$f,$c,0\n dcb $c,$f,$c,$ff,24,1,0,$f,$c,0,$c,$f,$c,$ff,24,1\n dcb $c,$f,$c,0,$c,$f,$c,$ff,24,1,0,$f,$c,0,$c,$f,$c\n dcb $ff,24,1,$c,$f,0,0,$c,$f,$c,$ff,24,1,0,$f,$c,0\n dcb $c,$f,$c,$ff,24,1,0,$f,$c,0,$c,$f,0,$ff,24,1\n dcb 0,$f,$c,0,$c,$f,0,$ff,23,1,$f,0,$f,$c,0,$c,$f,0,$f\n dcb $ff,22,1,$c,0,1,$c,0,$c,$f,0,$c,$ff,21,1\n dcb $f,0,0,1,0,0,$c,1,0,0,$ff,21,1,$c,0,$c,1,$c,0\n dcb $c,1,$c,0,$c,$ff,19,1,$f,0,0,$f,1,$c,0\n dcb $c,1,$f,0,0,$f,$ff,17,1,$f,0,0,0,1,1,$c,0\n dcb $c,1,1,0,0,0,$ff,16,1,$f,0,0,0,$f,1,1,0,0\n dcb $c,1,1,$f,0,0,0,$f,$ff,13,1\n dcb $c,0,0,0,$c,1,1,1,$c,0,$c,1,1,1,$c,0,0,0,$c\n dcb $ff,10,1,$c,0,0,0,0,$c,1,1,1,1,0,0\n dcb $c,1,1,1,1,0,0,0,0,0,$c,$ff,8,1\n dcb 0,0,0,0,$c,1,1,1,1,1,0,0\n dcb $c,1,1,1,1,1,$c,0,0,0,0,1,1,1,1,1\n dcb 1,1,1,1,0,0,$c,1,1,1,1,1,1,1,$c,0\n dcb $c,1,1,1,1,1,1,$f,$c,0,0,$ff,18,1,$f\n dcb $ff,53,1,0,$f,1,0,0,0,0,0,$f,1,$c\n dcb $c,1,1,1,$c,0,0,0,1,1,0,$f,$f,1,1,1\n dcb 1,1,1,1,$c,0,0,1,1,1,0,$f,1,1,$f,0\n dcb 0,$f,1,1,0,$f,1,$c,$c,1,0,$f,1,1,1,1\n dcb 1,1,1,1,0,$f,0,$f,1,1,0,$f,1,1,$f,$c\n dcb $c,$c,1,1,0,1,1,$f,0,1,0,$f,1,1,1,1\n dcb 1,1,1,1,0,1,$c,$f,1,1,$c,$f,1,1,0,$f\n dcb $f,0,1,1,0,$f,$f,0,$f,1,0,$f,1,1,1,1\n dcb 1,1,1,$c,0,$c,0,0,1,1,0,$f,1,1,0,$c\n dcb $c,0,$f,1,0,$f,0,$f,1,1,0,$f,1,1,1,1\n dcb 1,1,1,0,$c,$f,$f,0,$f,1,$c,$f,1,$c,$c,$f\n dcb $f,$c,$c,1,0,1,$f,$c,1,1,0,$f,1,1,1,1\n dcb 1,1,$f,0,1,1,1,$c,$c,1,0,$f,1,0,$f,1\n dcb 1,$f,0,1,0,$f,1,0,$f,1,0,$f,$ff,16,1\n dcb $f,$ff,5,1,$f,1,1,1,$f,$ff,38,1");
	});

	$('body').on('click', '#exampleColors', function() {
		example(" ldx #0\n ldy #0\n ;init screen\n lda #0\n sta $0\n lda #2\n sta $1\nloop:\n lda colors,x\n bpl ok\n inc $0\n ldx #0\n lda colors,x\nok:\n inx\n sta ($0),y\n iny\n bne ok2\n inc $1\nok2:\n jmp loop\n\ncolors:\n dcb 0,2,0,2,2,8,2,8,8,7,8,7,7,1,7,1,1,7,1,7,7,8,7,8,8,2,8,2,2,0,2,0\n dcb 2,2,8,2,8,8,7,8,7,7,1,7,1,1,1,1,1,1,1,1,7,1,7,7,8,7,8,8,2,8,2,2,$ff");
	});

	$('body').on('click', '#exampleDemoScene', function() {
		example('start:\n  ldx #0\nc:lda bottombar,x\n  cmp #$ff\n  beq init\n  sta $4e0,x\n  sta $5e0,x\n  inx\n  jmp c\ninit:\n  jsr initDraw\n  lda #0\n  sta $10 ; scrptr\n  sta $11 ; txtptr\nloop:\n  jsr drawMain\n  jsr putfont\n  jsr scrollarea\n  jmp loop\n\nscrollarea:\n  ldx #0\ng:lda $521,x\n  sta $520,x\n  lda $541,x\n  sta $540,x\n  lda $561,x\n  sta $560,x\n  lda $581,x\n  sta $580,x\n  lda $5a1,x\n  sta $5a0,x\n  inx\n  cpx #31\n  bne g\n  rts\n\nputfont:\n  lda $10 ; scrptr\n  cmp #0\n  bne noNext\n  inc $11\n  ldx $11\n  lda scrolltext,x\n  tax\n  lda fontSize,x\n  sta $10\nnoNext:\n  dec $10\n  ldx $11\n  lda scrolltext,x\n  cmp #$ff\n  bne notResetText\n  lda #0\n  sta $10\n  sta $11\n  rts\n\nnotResetText:\n  asl\n  tax\n  lda fontlookup,x\n  sta $2\n  inx\n  lda fontlookup,x\n  sta $3\n  lda #<fonts\n  clc\n  adc $2\n  sta $0\n  lda #>fonts\n  adc $3\n  sta $1\n  ldy $10\n  lda ($00),y\n  sta $53f\n  tya\n  clc\n  adc #6\n  tay\n  lda ($00),y\n  sta $55f\n  tya\n  clc\n  adc #6\n  tay\n  lda ($00),y\n  sta $57f\n  tya\n  clc\n  adc #6\n  tay\n  lda ($00),y\n  sta $59f\n  tya\n  clc\n  adc #6\n  tay\n  lda ($00),y\n  sta $5bf\n  rts\n\ninitDraw:\n  lda #<picture\n  sta $20\n  lda #>picture\n  sta $21\n  lda #$00\n  sta $22\n  lda #$02\n  sta $23\n  ldx #$0\n  rts\ndrawMain:\n  ldx #0\n  lda ($20,x)\n  cmp #$ff\n  beq done\n  sta ($22,x)\n  inc $20\n  lda $20\n  cmp #$00\n  bne n1\n  inc $21\nn1:\n  inc $22\n  lda $22 \n  cmp #$00\n  bne done\n  lda $23\n  cmp #$05\n  beq done\n  inc $23\ndone:\n  rts\n\npicture:\n  dcb 0,0,0,0,0,0,0,0,0,$b,$b,$c,$f,$f,$f,$f\n  dcb $f,$b,0,0,0,$b,$b,$c,$c,$f,$f,$b,0,0,0,0\n  dcb 0,0,0,0,0,0,0,0,0,$b,$c,$c,$f,$c,$f,$f\n  dcb $b,$b,$b,$b,$b,0,$b,$b,$c,$f,$f,$c,0,0,0,0\n  dcb 0,0,0,0,0,0,0,$b,0,$c,$b,$f,$c,$f,$f,$c\n  dcb $c,$b,0,$b,$c,$c,$c,$f,$f,1,$f,$c,$b,0,0,0\n  dcb 0,0,0,0,0,0,0,0,$b,$b,$c,$c,$c,$f,$f,$f\n  dcb $c,$c,$c,$c,$c,$c,$f,$c,$f,$f,$f,$f,$b,0,0,0\n  dcb 0,0,0,0,0,0,0,$b,0,0,$b,$c,$c,$f,$f,$f\n  dcb $f,$c,$f,$f,$f,$f,$f,$f,$f,1,$f,$f,$c,0,0,0\n  dcb 0,0,0,0,0,0,0,0,0,$b,$b,$b,$c,$f,$f,1\n  dcb $f,$f,$c,$f,$f,$f,1,$f,$f,$f,$f,$f,$f,0,0,0\n  dcb 0,0,0,0,0,0,0,0,0,$b,$b,$b,$b,$c,$f,1\n  dcb $f,$f,$f,$f,$f,$f,$f,$f,1,$f,$f,$f,$f,$b,0,0\n  dcb 0,0,0,0,0,0,0,0,$b,0,$b,$c,$b,$c,$c,1\n  dcb 1,$f,1,$f,1,$f,1,$f,$f,1,$f,$f,1,$b,0,0\n  dcb 0,0,0,0,0,0,0,$b,$b,$b,$c,$c,$b,$c,$f,1\n  dcb 1,1,$f,$f,1,$f,$f,1,$f,$f,$f,$f,1,$c,0,0\n  dcb 0,0,0,0,0,0,0,$b,$b,$c,$c,$c,$b,$c,$c,$f\n  dcb 1,1,1,$f,$f,1,$f,1,$f,1,$f,$f,1,$c,0,0\n  dcb 0,0,0,0,0,$b,$b,$b,$c,$c,$c,$f,$c,$c,$f,$f\n  dcb 1,1,1,1,$f,$f,$f,1,$f,1,$f,$f,$f,$f,0,0\n  dcb 0,0,0,0,0,0,$b,$c,$c,$c,$f,$c,$f,$c,$f,$f\n  dcb 1,1,1,1,1,$f,$f,1,$f,$f,$f,$f,1,$f,$b,0\n  dcb 0,0,0,0,$b,$b,$b,$c,$c,$f,$c,$f,$f,$c,$f,$f\n  dcb 1,1,1,1,1,$f,$f,$f,1,$f,$f,$f,1,$c,$b,$b\n  dcb 0,0,0,0,$b,$b,$c,$f,$c,$f,$f,$f,$f,$f,$c,$f\n  dcb 1,1,1,1,1,$f,$f,$f,1,$f,$f,$f,$f,$f,$b,$b\n  dcb 0,0,0,0,$b,$c,$c,$c,$f,$f,$f,$f,$f,$f,$f,$f\n  dcb $f,1,1,1,$f,$b,$f,$f,$f,1,$f,$f,$f,$f,$b,$b\n  dcb 0,0,0,0,$b,$c,$c,$f,$c,$f,$f,$f,$f,$f,$f,$f\n  dcb $f,$f,$f,$c,$b,$f,$f,1,$f,$f,$f,$f,$f,$f,$c,$b\n  dcb 0,0,0,0,$b,$b,$c,$c,$f,$c,$f,$f,$f,$f,$f,$f\n  dcb $c,$c,$b,$c,$c,$f,$f,1,$c,$c,$f,$f,$f,$f,$c,$b\n  dcb 0,0,0,0,$b,$b,$c,$c,$c,$f,$f,$f,$f,$f,$f,$f\n  dcb $f,$f,$f,$f,$f,1,$f,$c,$b,$f,$c,$f,$c,$f,$c,$b\n  dcb 0,0,0,0,0,$b,$c,$c,$c,$c,$f,$f,$f,$f,$f,$f\n  dcb $f,$f,$f,$f,$f,$c,$b,$c,$c,$c,$f,$f,$c,$f,$c,$c\n  dcb 0,0,0,0,0,$b,$b,$c,$c,$c,$c,$c,$f,$f,$f,$f\n  dcb $f,$f,$f,$c,$b,$b,$c,$c,$c,$f,$c,$f,$f,$f,$c,$b\n  dcb 0,0,0,0,0,$b,$b,$b,$b,$c,$c,$f,$c,$f,$f,$f\n  dcb $c,$c,$b,$b,$b,$c,$b,$b,$c,$c,$f,$c,$c,$f,$c,$c\n  dcb 0,0,0,0,0,0,$b,$b,$c,$b,$c,$c,$c,$c,$c,$c\n  dcb $b,$b,$b,$b,$c,$b,$b,$c,$c,$f,$f,$f,$c,$c,$c,$b\n  dcb 0,0,0,0,0,0,0,0,$b,$b,$b,$c,$c,$c,$c,$c\n  dcb $c,$c,$b,$b,$b,$b,$c,$c,$f,$f,$f,$c,$c,$c,$c,$c\n  dcb $ff\n\n\nfontSize:\n  dcb 5,5,5,5,5,5,5,5 ;abcdefgh\n  dcb 2,5,5,5,6,6,5,5 ;ijklmnop\n  dcb 6,5,5,4,5,6,6,6 ;qrstuvwx\n  dcb 6,5,2,3         ;yz.[SPACE]\n\n;\n; a=0, b=1, c=2, d=3....\n;\n\nscrolltext:\n  dcb 0\n\n  dcb 14,13,11,24,27           ; "only "\n  dcb 03,04,15,19,07,27        ; "depth "\n  dcb 12,0,10,4,18,27          ; "makes "\n  dcb 8,19,27                  ; "it "\n  dcb 15,14,18,18,8,1,11,4     ; "possible"\n  dcb 26,26,26                 ; "..."\n  dcb 19,7,8,18,27             ; "this "\n  dcb 8,18,27                  ; "is "\n  dcb 19,7,4,27                ; "the "\n  dcb 5,8,17,18,19,27          ; "first "\n  dcb 3,4,12,14,27             ; "demo "\n  dcb 12,0,3,4,27              ; "made "\n  dcb 8,13,27                  ; "in "\n  dcb 19,7,8,18,27             ; "this "\n  dcb 4,13,21,26,26,26,26,27   ; "env.... "\n  dcb 7,14,15,4,27             ; "hope "\n  dcb 24,14,20,27              ; "you "\n  dcb 11,8,10,4,27             ; "like "\n  dcb 8,19,26,26,26,27,27      ; "it...  "\n  dcb 22,22,22,26              ; "www."\n  dcb 3,4,15,19,7,26           ; "depth."\n  dcb 14,17,6,27,27,27,27,27   ; "org     "\n\n  dcb $ff                      ; end of text\n\nfontlookup:\n  dcb $00,$00 ;a\n  dcb $20,$00 ;b\n  dcb $40,$00 ;c\n  dcb $60,$00 ;d\n  dcb $80,$00 ;e\n  dcb $a0,$00 ;f\n  dcb $c0,$00 ;g\n  dcb $e0,$00 ;h\n  dcb $00,$01 ;i\n  dcb $20,$01 ;j\n  dcb $40,$01 ;k\n  dcb $60,$01 ;l\n  dcb $80,$01 ;m\n  dcb $a0,$01 ;n\n  dcb $c0,$01 ;o\n  dcb $e0,$01 ;p\n  dcb $00,$02 ;q\n  dcb $20,$02 ;r\n  dcb $40,$02 ;s\n  dcb $60,$02 ;t\n  dcb $80,$02 ;u\n  dcb $a0,$02 ;v\n  dcb $c0,$02 ;w\n  dcb $e0,$02 ;x\n  dcb $00,$03 ;y\n  dcb $20,$03 ;z\n  dcb $40,$03 ;.\n  dcb $60,$03 ;" "\n\nfonts:\n  dcb 0,1,1,0,0,0\n  dcb 1,0,0,1,0,0\n  dcb 1,1,1,1,0,0\n  dcb 1,0,0,1,0,0\n  dcb 1,0,0,1,0,0\n  dcb 0,0\n\n  dcb 0,1,1,1,0,0\n  dcb 1,0,0,1,0,0\n  dcb 0,1,1,1,0,0\n  dcb 1,0,0,1,0,0\n  dcb 0,1,1,1,0,0\n  dcb 0,0\n\n  dcb 0,1,1,0,0,0\n  dcb 1,0,0,1,0,0\n  dcb 0,0,0,1,0,0\n  dcb 1,0,0,1,0,0\n  dcb 0,1,1,0,0,0\n  dcb 0,0\n\n  dcb 0,1,1,1,0,0\n  dcb 1,0,0,1,0,0\n  dcb 1,0,0,1,0,0\n  dcb 1,0,0,1,0,0\n  dcb 0,1,1,1,0,0\n  dcb 0,0\n\n  dcb 1,1,1,1,0,0\n  dcb 0,0,0,1,0,0\n  dcb 0,1,1,1,0,0\n  dcb 0,0,0,1,0,0\n  dcb 1,1,1,1,0,0\n  dcb 0,0\n\n  dcb 1,1,1,1,0,0\n  dcb 0,0,0,1,0,0\n  dcb 0,1,1,1,0,0\n  dcb 0,0,0,1,0,0\n  dcb 0,0,0,1,0,0\n  dcb 0,0\n\n  dcb 1,1,1,0,0,0\n  dcb 0,0,0,1,0,0\n  dcb 1,1,0,1,0,0\n  dcb 1,0,0,1,0,0\n  dcb 1,1,1,0,0,0\n  dcb 0,0\n\n  dcb 1,0,0,1,0,0\n  dcb 1,0,0,1,0,0\n  dcb 1,1,1,1,0,0\n  dcb 1,0,0,1,0,0\n  dcb 1,0,0,1,0,0\n  dcb 0,0\n\n  dcb 1,0,0,0,0,0\n  dcb 1,0,0,0,0,0\n  dcb 1,0,0,0,0,0\n  dcb 1,0,0,0,0,0\n  dcb 1,0,0,0,0,0\n  dcb 0,0\n\n  dcb 1,0,0,0,0,0\n  dcb 1,0,0,0,0,0\n  dcb 1,0,0,0,0,0\n  dcb 1,0,0,1,0,0\n  dcb 0,1,1,0,0,0\n  dcb 0,0\n\n  dcb 1,0,0,1,0,0\n  dcb 0,1,0,1,0,0\n  dcb 0,0,1,1,0,0\n  dcb 0,1,0,1,0,0\n  dcb 1,0,0,1,0,0\n  dcb 0,0\n\n  dcb 0,0,0,1,0,0\n  dcb 0,0,0,1,0,0\n  dcb 0,0,0,1,0,0\n  dcb 0,0,0,1,0,0\n  dcb 1,1,1,1,0,0\n  dcb 0,0\n\n  dcb 1,0,0,0,1,0\n  dcb 1,1,0,1,1,0\n  dcb 1,0,1,0,1,0\n  dcb 1,0,0,0,1,0\n  dcb 1,0,0,0,1,0\n  dcb 0,0\n\n  dcb 1,0,0,0,1,0\n  dcb 1,0,0,1,1,0\n  dcb 1,0,1,0,1,0\n  dcb 1,1,0,0,1,0\n  dcb 1,0,0,0,1,0\n  dcb 0,0\n\n  dcb 0,1,1,0,0,0\n  dcb 1,0,0,1,0,0\n  dcb 1,0,0,1,0,0\n  dcb 1,0,0,1,0,0\n  dcb 0,1,1,0,0,0\n  dcb 0,0\n\n  dcb 0,1,1,1,0,0\n  dcb 1,0,0,1,0,0\n  dcb 0,1,1,1,0,0\n  dcb 0,0,0,1,0,0\n  dcb 0,0,0,1,0,0\n  dcb 0,0\n\n  dcb 0,1,1,0,0,0\n  dcb 1,0,0,1,0,0\n  dcb 1,0,0,1,0,0\n  dcb 0,1,0,1,0,0\n  dcb 1,0,1,0,0,0\n  dcb 0,0\n\n  dcb 0,1,1,1,0,0\n  dcb 1,0,0,1,0,0\n  dcb 0,1,1,1,0,0\n  dcb 0,1,0,1,0,0\n  dcb 1,0,0,1,0,0\n  dcb 0,0\n\n  dcb 1,1,1,0,0,0\n  dcb 0,0,0,1,0,0\n  dcb 0,1,1,0,0,0\n  dcb 1,0,0,0,0,0\n  dcb 0,1,1,1,0,0\n  dcb 0,0\n\n  dcb 1,1,1,0,0,0\n  dcb 0,1,0,0,0,0\n  dcb 0,1,0,0,0,0\n  dcb 0,1,0,0,0,0\n  dcb 0,1,0,0,0,0\n  dcb 0,0\n\n  dcb 1,0,0,1,0,0\n  dcb 1,0,0,1,0,0\n  dcb 1,0,0,1,0,0\n  dcb 1,0,0,1,0,0\n  dcb 1,1,1,0,0,0\n  dcb 0,0\n\n  dcb 1,0,0,0,1,0\n  dcb 1,0,0,0,1,0\n  dcb 1,0,0,0,1,0\n  dcb 0,1,0,1,0,0\n  dcb 0,0,1,0,0,0\n  dcb 0,0\n\n  dcb 1,0,0,0,1,0\n  dcb 1,0,0,0,1,0\n  dcb 1,0,1,0,1,0\n  dcb 1,1,0,1,1,0\n  dcb 1,0,0,0,1,0\n  dcb 0,0\n\n  dcb 1,0,0,0,1,0\n  dcb 0,1,0,1,0,0\n  dcb 0,0,1,0,0,0\n  dcb 0,1,0,1,0,0\n  dcb 1,0,0,0,1,0\n  dcb 0,0\n\n  dcb 1,0,0,0,1,0\n  dcb 0,1,0,1,0,0\n  dcb 0,0,1,0,0,0\n  dcb 0,0,1,0,0,0\n  dcb 0,0,1,0,0,0\n  dcb 0,0\n\n  dcb 1,1,1,1,0,0 ; z\n  dcb 1,0,0,0,0,0\n  dcb 0,1,1,0,0,0\n  dcb 0,0,0,1,0,0\n  dcb 1,1,1,1,0,0\n  dcb 0,0\n\n  dcb 0,0,0,0,0,0 ; .\n  dcb 0,0,0,0,0,0\n  dcb 0,0,0,0,0,0\n  dcb 0,0,0,0,0,0\n  dcb 1,0,0,0,0,0\n  dcb 0,0\n\n  dcb 0,0,0,0,0,0 ; " "\n  dcb 0,0,0,0,0,0\n  dcb 0,0,0,0,0,0\n  dcb 0,0,0,0,0,0\n  dcb 0,0,0,0,0,0\n  dcb 0,0\n\nbottombar:\n  dcb $b,$9,$b,9,8,9,8,$a,8,$a,7,$a,7,1,7,1,1\n  dcb 7,1,7,$a,7,$a,8,$a,8,9,8,9,$b,9,$b\n  dcb $ff');
	});

	$('body').on('click', '#exampleDisco', function() {
		example("start:\n inx\n txa\n sta $200, y\n sta $300, y\n sta $400, y\n sta $500, y\n iny\n tya\n cmp 16\n bne do\n iny\n jmp start\ndo:\n iny\n iny\n iny\n iny\njmp start");
	});

	$('body').on('click', '#exampleCommodore', function() {
		example("start:\n  lda #<logo\n  sta $0\n  lda #>logo\n  sta $1\n\n  lda #$00\n  sta $2\n  lda #$02\n  sta $3\n\n  ldx #$0\nl:\n  lda ($0,x)\n  sta ($2,x)\n\n  inc $00\n  lda $00\n  cmp #$00\n  bne notReset1\n  inc $01\nnotReset1:\n\n  inc $02\n  lda $02 \n  cmp #$00\n  bne notReset2\n  lda $03\n  cmp #$05\n  beq done\n  inc $03\nnotReset2:\n\n  jmp l\ndone:\n  rts\n\nlogo:\n dcb 1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1\n dcb 1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1\n dcb 1,1,1,1,1,1,1,1,1,1,1,1,1,6,6,6\n dcb 6,6,6,6,1,1,1,1,1,1,1,1,1,1,1,1\n dcb 1,1,1,1,1,1,1,1,1,1,6,6,6,6,6,6\n dcb 6,6,6,6,6,1,1,1,1,1,1,1,1,1,1,1\n dcb 1,1,1,1,1,1,1,1,6,6,6,6,6,6,6,6\n dcb 6,6,6,6,6,1,1,1,1,1,1,1,1,1,1,1\n dcb 1,1,1,1,1,1,1,6,6,6,6,6,6,6,6,6\n dcb 6,6,6,6,6,1,1,1,1,1,1,1,1,1,1,1\n dcb 1,1,1,1,1,1,6,6,6,6,6,6,6,6,6,6\n dcb 6,6,6,6,6,1,1,1,1,1,1,1,1,1,1,1\n dcb 1,1,1,1,1,6,6,6,6,6,6,6,6,6,6,6\n dcb 6,6,6,6,6,1,1,1,1,1,1,1,1,1,1,1\n dcb 1,1,1,1,6,6,6,6,6,6,6,6,6,6,6,6\n dcb 6,6,6,6,6,1,1,1,1,1,1,1,1,1,1,1\n dcb 1,1,1,6,6,6,6,6,6,6,6,6,6,6,6,1\n dcb 1,1,1,6,6,1,1,1,1,1,1,1,1,1,1,1\n dcb 1,1,1,6,6,6,6,6,6,6,6,6,6,1,1,1\n dcb 1,1,1,1,1,6,6,6,6,6,6,6,6,6,6,6\n dcb 1,1,6,6,6,6,6,6,6,6,6,1,1,1,1,1\n dcb 1,1,1,1,1,6,6,6,6,6,6,6,6,6,6,1\n dcb 1,1,6,6,6,6,6,6,6,6,1,1,1,1,1,1\n dcb 1,1,1,1,1,6,6,6,6,6,6,6,6,6,1,1\n dcb 1,1,6,6,6,6,6,6,6,6,1,1,1,1,1,1\n dcb 1,1,1,1,1,6,6,6,6,6,6,6,6,1,1,1\n dcb 1,6,6,6,6,6,6,6,6,1,1,1,1,1,1,1\n dcb 1,1,1,1,1,6,6,6,6,6,6,6,1,1,1,1\n dcb 1,6,6,6,6,6,6,6,6,1,1,1,1,1,1,1\n dcb 1,1,1,1,1,6,6,6,6,6,6,1,1,1,1,1\n dcb 1,6,6,6,6,6,6,6,6,1,1,1,1,1,1,1\n dcb 1,1,1,1,1,6,6,6,6,6,1,1,1,1,1,1\n dcb 1,6,6,6,6,6,6,6,6,1,1,1,1,1,1,1\n dcb 1,1,1,1,1,2,2,2,2,2,1,1,1,1,1,1\n dcb 1,6,6,6,6,6,6,6,6,1,1,1,1,1,1,1\n dcb 1,1,1,1,1,2,2,2,2,2,2,1,1,1,1,1\n dcb 1,6,6,6,6,6,6,6,6,1,1,1,1,1,1,1\n dcb 1,1,1,1,1,2,2,2,2,2,2,2,1,1,1,1\n dcb 1,6,6,6,6,6,6,6,6,1,1,1,1,1,1,1\n dcb 1,1,1,1,1,2,2,2,2,2,2,2,2,1,1,1\n dcb 1,1,6,6,6,6,6,6,6,6,1,1,1,1,1,1\n dcb 1,1,1,1,1,2,2,2,2,2,2,2,2,2,1,1\n dcb 1,1,6,6,6,6,6,6,6,6,6,1,1,1,1,1\n dcb 1,1,1,1,1,2,2,2,2,2,2,2,2,2,2,1\n dcb 1,1,1,6,6,6,6,6,6,6,6,6,1,1,1,1\n dcb 1,1,1,1,1,2,2,2,2,2,2,2,2,2,2,2\n dcb 1,1,1,6,6,6,6,6,6,6,6,6,6,1,1,1\n dcb 1,1,1,1,6,1,1,1,1,1,1,1,1,1,1,1\n dcb 1,1,1,1,6,6,6,6,6,6,6,6,6,6,6,6\n dcb 6,6,6,6,6,1,1,1,1,1,1,1,1,1,1,1\n dcb 1,1,1,1,6,6,6,6,6,6,6,6,6,6,6,6\n dcb 6,6,6,6,6,1,1,1,1,1,1,1,1,1,1,1\n dcb 1,1,1,1,1,6,6,6,6,6,6,6,6,6,6,6\n dcb 6,6,6,6,6,1,1,1,1,1,1,1,1,1,1,1\n dcb 1,1,1,1,1,1,6,6,6,6,6,6,6,6,6,6\n dcb 6,6,6,6,6,1,1,1,1,1,1,1,1,1,1,1\n dcb 1,1,1,1,1,1,1,1,6,6,6,6,6,6,6,6\n dcb 6,6,6,6,6,1,1,1,1,1,1,1,1,1,1,1\n dcb 1,1,1,1,1,1,1,1,1,6,6,6,6,6,6,6\n dcb 6,6,6,6,6,1,1,1,1,1,1,1,1,1,1,1\n dcb 1,1,1,1,1,1,1,1,1,1,1,1,6,6,6,6\n dcb 6,6,6,6,6,1,1,1,1,1,1,1,1,1,1,1\n dcb 1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1\n dcb 1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1");
	});

	$('body').on('click', '#exampleStarfield', function() {
		example("i:ldx #$7\ng:lda $fe\n  and #3\n  adc #1\n  sta $0,x\n  lda $fe\n  and #$1f\n  sta $20,x\n  dex\n  bpl g\nf:lda #$00\n  sta $80\n  lda #$02\n  sta $81\n  ldx #$7\nl:lda $20,x\n  pha\n  clc\n  sbc $00,x\n  and #$1f\n  sta $20,x\n  lda $20,x\n  tay\n  lda #1\n  sta ($80),y\n  pla\n  tay\n  lda #0\n  sta ($80),y\n  lda $80\n  clc\n  adc #$80\n  bne n\n  inc $81\nn:sta $80\n  dex\n  bpl l\n  jmp f");
	});

	$('body').on('click', '#exampleRandom', function() {
		example("loop: lda $fe       ; A=rnd\n      sta $00       ; ZP(0)=A\n      lda $fe\n      and #$3       ; A=A&3\n      clc           ; Clear carry\n      adc #$2       ; A+=2\n      sta $01       ; ZP(1)=A\n      lda $fe       ; A=rnd\n      ldy #$0       ; Y=0\n      sta ($00),y   ; ZP(0),ZP(1)=y\n      jmp loop");
	});

	// 6502 Emulator

	var MAX_MEM = ((32*32)-1);
	var codeCompiledOK = false;
	var regA = 0;
	var regX = 0;
	var regY = 0;
	var regP = 0;
	var regPC = 0x600;
	var regSP = 0x100;
	var memory = new Array( 0x600 );
	var runForever = false;
	var labelIndex = new Array();
	var labelPtr = 0;
	var codeRunning = false;
	var xmlhttp;
	var myInterval;
	var display = new Array( 0x400 );
	var defaultCodePC = 0x600;
	var palette = new Array(
	  "#000000", "#ffffff", "#880000", "#aaffee",
	  "#cc44cc", "#00cc55", "#0000aa", "#eeee77",
	  "#dd8855", "#664400", "#ff7777", "#333333",
	  "#777777", "#aaff66", "#0088ff", "#bbbbbb" );

	var Opcodes = new Array(

		/* Name, Imm,  ZP,   ZPX,  ZPY,  ABS,  ABSX, ABSY, INDX, INDY, SNGL, BRA */

	Array("ADC", 0x69, 0x65, 0x75, 0x00, 0x6d, 0x7d, 0x79, 0x61, 0x71, 0x00, 0x00 ),
	Array("AND", 0x29, 0x25, 0x35, 0x00, 0x2d, 0x3d, 0x39, 0x21, 0x31, 0x00, 0x00 ),
	Array("ASL", 0x00, 0x06, 0x16, 0x00, 0x0e, 0x1e, 0x00, 0x00, 0x00, 0x0a, 0x00 ),
	Array("BIT", 0x00, 0x24, 0x00, 0x00, 0x2c, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00 ),
	Array("BPL", 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x10 ),
	Array("BMI", 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x30 ),
	Array("BVC", 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x50 ),
	Array("BVS", 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x70 ),
	Array("BCC", 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x90 ),
	Array("BCS", 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0xb0 ),
	Array("BNE", 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0xd0 ),
	Array("BEQ", 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0xf0 ),
	Array("CMP", 0xc9, 0xc5, 0xd5, 0x00, 0xcd, 0xdd, 0xd9, 0xc1, 0xd1, 0x00, 0x00 ),
	Array("CPX", 0xe0, 0xe4, 0x00, 0x00, 0xec, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00 ),
	Array("CPY", 0xc0, 0xc4, 0x00, 0x00, 0xcc, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00 ),
	Array("DEC", 0x00, 0xc6, 0xd6, 0x00, 0xce, 0xde, 0x00, 0x00, 0x00, 0x00, 0x00 ),
	Array("EOR", 0x49, 0x45, 0x55, 0x00, 0x4d, 0x5d, 0x59, 0x41, 0x51, 0x00, 0x00 ),
	Array("CLC", 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x18, 0x00 ),
	Array("SEC", 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x38, 0x00 ),
	Array("CLI", 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x58, 0x00 ),
	Array("SEI", 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x78, 0x00 ),
	Array("CLV", 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0xb8, 0x00 ),
	Array("CLD", 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0xd8, 0x00 ),
	Array("SED", 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0xf8, 0x00 ),
	Array("INC", 0x00, 0xe6, 0xf6, 0x00, 0xee, 0xfe, 0x00, 0x00, 0x00, 0x00, 0x00 ),
	Array("JMP", 0x00, 0x00, 0x00, 0x00, 0x4c, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00 ),
	Array("JSR", 0x00, 0x00, 0x00, 0x00, 0x20, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00 ),
	Array("LDA", 0xa9, 0xa5, 0xb5, 0x00, 0xad, 0xbd, 0xb9, 0xa1, 0xb1, 0x00, 0x00 ),
	Array("LDX", 0xa2, 0xa6, 0x00, 0xb6, 0xae, 0x00, 0xbe, 0x00, 0x00, 0x00, 0x00 ),
	Array("LDY", 0xa0, 0xa4, 0xb4, 0x00, 0xac, 0xbc, 0x00, 0x00, 0x00, 0x00, 0x00 ),
	Array("LSR", 0x00, 0x46, 0x56, 0x00, 0x4e, 0x5e, 0x00, 0x00, 0x00, 0x4a, 0x00 ),
	Array("NOP", 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0xea, 0x00 ),
	Array("ORA", 0x09, 0x05, 0x15, 0x00, 0x0d, 0x1d, 0x19, 0x01, 0x11, 0x00, 0x00 ),
	Array("TAX", 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0xaa, 0x00 ),
	Array("TXA", 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x8a, 0x00 ),
	Array("DEX", 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0xca, 0x00 ),
	Array("INX", 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0xe8, 0x00 ),
	Array("TAY", 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0xa8, 0x00 ),
	Array("TYA", 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x98, 0x00 ),
	Array("DEY", 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x88, 0x00 ),
	Array("INY", 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0xc8, 0x00 ),
	Array("ROR", 0x00, 0x66, 0x76, 0x00, 0x6e, 0x7e, 0x00, 0x00, 0x00, 0x6a, 0x00 ),
	Array("ROL", 0x00, 0x26, 0x36, 0x00, 0x2e, 0x3e, 0x00, 0x00, 0x00, 0x2a, 0x00 ),
	Array("RTI", 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x40, 0x00 ),
	Array("RTS", 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x60, 0x00 ),
	Array("SBC", 0xe9, 0xe5, 0xf5, 0x00, 0xed, 0xfd, 0xf9, 0xe1, 0xf1, 0x00, 0x00 ),
	Array("STA", 0x00, 0x85, 0x95, 0x00, 0x8d, 0x9d, 0x99, 0x81, 0x91, 0x00, 0x00 ),
	Array("TXS", 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x9a, 0x00 ),
	Array("TSX", 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0xba, 0x00 ),
	Array("PHA", 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x48, 0x00 ),
	Array("PLA", 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x68, 0x00 ),
	Array("PHP", 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x08, 0x00 ),
	Array("PLP", 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x28, 0x00 ),
	Array("STX", 0x00, 0x86, 0x00, 0x96, 0x8e, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00 ),
	Array("STY", 0x00, 0x84, 0x94, 0x00, 0x8c, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00 ),
	Array("---", 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00 )
	);

	// Initialize everything.

	document.getElementById( "runButton" ).disabled = true;
	//document.getElementById( "hexdumpButton" ).disabled = true;
	//document.getElementById( "submitCode" ).disabled = true;

	document.addEventListener( "keypress", keyPress, true );

	// Paint the "display"

	html = '<table class="screen">';
	for( y=0; y<32; y++ ) {
	  html += "<tr>";
	  for( x=0; x<32; x++ ) {
		html += '<td class="screen" id="x' + x + 'y' + y + '"></td>';
	  }
	  html += "</tr>";
	}
	html += "</table>";
	document.getElementById( "screen" ).innerHTML = html;

	// Reset everything

	reset();

	/*
	 *  keyPress() - Store keycode in ZP $ff
	 *
	 */

	function keyPress( e ) {
	  if( typeof window.event != "undefined" )
		e = window.event; // IE fix
	  if( e.type == "keypress" ) {
		value = e.which;
		memStoreByte( 0xff, value );
	  }
	}


	/*
	 *  disableButtons() - Disables the Run and Debug buttons when text is
	 *                     altered in the code editor
	 *
	 */

	function disableButtons() {
	  $('#runButton').addClass('disabled');
	//  document.getElementById( "hexdumpButton" ).disabled = true;
	  $('#runButton').html('Run');
	//  document.getElementById( "submitCode" ).disabled = true;
	  codeCompiledOK = false;
	  codeRunning = false;
	  document.getElementById( "code" ).focus();
	}

	/*
	 *  Load() - Loads a file from server
	 *
	 */

	function Load( file ) {
	  reset();
	  disableButtons();
	  document.getElementById( "code" ).value = "Loading, please wait..";
	  $('#compileButton').addClass('disabled');
	  xmlhttp = new XMLHttpRequest();
	  xmlhttp.onreadystatechange = FileLoaded;
	  xmlhttp.open( "GET", "examples/" + file );
	  xmlhttp.send( null );
	}

	function FileLoaded() {
	  if( xmlhttp.readyState == 4 )
		if( xmlhttp.status == 200 ) {
		  document.getElementById( "code" ).value = xmlhttp.responseText;
		}
	}

	/*
	 *  reset() - Reset CPU and memory.
	 *
	 */

	function reset() {
	  for( y=0; y<32; y++ )
		for( x=0; x<32; x++ ) {
		  display[y*32+x] = document.getElementById( "x"+x+"y"+y ).style;
		  display[y*32+x].background = "#000000";
		}
	  for( x=0; x<0x600; x++ )  // clear ZP, stack and screen
		memory[x] = 0x00;
	  regA = regX = regY = 0;
	  defaultCodePC = regPC = 0x600;
	  regSP = 0x100;
	  regP = 0x20;
	  runForever = false;
	}


	/*
	 *  message() - Prints text in the message window
	 *
	 */

	function message( text ) {
		var date = new Date();
		var hour = date.getHours();
		var min = date.getMinutes();
		var sec = date.getSeconds();
		$('#messages').append('[' + hour + ':' + min + ':' + sec + '] ' + text + '<br />');
	}

	/*
	 *  compileCode()
	 *
	 *  "Compiles" the code into a string (global var compiledCode)
	 *
	 */

	function compileCode() {
	  reset();
	  $('#messages').html('');

	  var code = document.getElementById( "code" ).value;
	  code += "\n\n";
	  lines = code.split( "\n" );
	  codeCompiledOK = true;
	  labelIndex = new Array();
	  labelPtr = 0;

	  message( "Indexing labels.." );

	  defaultCodePC = regPC = 0x600;

	  for( xc=0; xc<lines.length; xc++ ) {
		if( ! indexLabels( lines[xc] ) ) {
		  message( "<b>Label already defined at line "+(xc+1)+":</b> "+lines[xc] );
		  return false;
		}
	  }

	  str = "Found " + labelIndex.length + " label";
	  if( labelIndex.length != 1 ) str += "s";
	  message( str + "." );

	  defaultCodePC = regPC = 0x600;
	  message( "Compiling code.." );

	  for( x=0; x<lines.length; x++ ) {
		if( ! compileLine( lines[x], x ) ) {
		  codeCompiledOK = false;
		  break;
		}
	  }

	  if( codeLen == 0 ) {
		codeCompiledOK = false;
		message( "No code to run!" );
		Materialize.toast('No code to run!', 3000, 'rounded');
	  }

	  if( codeCompiledOK ) {
		memory[defaultCodePC] = 0x00;
	  } else {
		str = lines[x].replace( "<", "&lt;" ).replace( ">", "&gt;" );
		message( "<b>Syntax error line " + (x+1) + ": " + str + "</b>");
		document.getElementById( "runButton" ).disabled = true;
		Materialize.toast('Syntax error line ' + (x+1) + ': ' + str, 3000, 'rounded');
		return;
	  }

	  updateDisplayFull();
	  message( "Code compiled, " + codeLen + " bytes." );
	  Materialize.toast('Code compiled, ' + codeLen + ' bytes.', 3000, 'rounded');
	}

	/*
	 *  indexLabels() - Pushes all labels to array.
	 *
	 */

	function indexLabels( input ) {

	  // remove comments

	  input = input.replace( new RegExp( /^(.*?);.*/ ), "$1" );

	  // trim line

	  input = input.replace( new RegExp( /^\s+/ ), "" );
	  input = input.replace( new RegExp( /\s+$/ ), "" );

	  // Figure out how many bytes this instuction takes

	  thisPC = defaultCodePC;

	  codeLen = 0;
	//  defaultCodePC = 0x600;
	  compileLine( input );
	  regPC += codeLen;

	  // Find command or label

	  if( input.match( new RegExp( /^\w+:/ ) ) ) {
		label = input.replace( new RegExp( /(^\w+):.*$/ ), "$1" );
		return pushLabel( label + "|" + thisPC );
	  }
	  return true;
	}

	/*
	 *  pushLabel() - Push label to array. Return false if label already exists.
	 *
	 */

	function pushLabel( name ) {
	  if( findLabel( name ) ) return false;
	  labelIndex[labelPtr++] = name + "|";
	  return true;
	}

	/*
	 *  findLabel() - Returns true if label exists.
	 *
	 */

	function findLabel( name ) {
	  for( m=0; m<labelIndex.length; m++ ) {
		nameAndAddr = labelIndex[m].split( "|" );
		if( name == nameAndAddr[0] ) {
		  return true;
		}
	  }
	  return false;
	}

	/*
	 *  setLabelPC() - Associates label with address
	 *
	 */

	function setLabelPC( name, addr ) {
	  for( i=0; i<labelIndex.length; i++ ) {
		nameAndAddr = labelIndex[i].split( "|" );
		if( name == nameAndAddr[0] ) {
		  labelIndex[i] = name + "|" + addr;
		  return true;
		}
	  }
	  return false;
	}

	/*
	 *  getLabelPC() - Get address associated with label
	 *
	 */

	function getLabelPC( name ) {
	  for( i=0; i<labelIndex.length; i++ ) {
		nameAndAddr = labelIndex[i].split( "|" );
		if( name == nameAndAddr[0] ) {
		  return (nameAndAddr[1]);
		}
	  }
	  return -1;
	}

	/*
	 *  compileLine()
	 *
	 *  Compiles one line of code.  Returns true if it compiled successfully,
	 *  false otherwise.
	 */

	function compileLine( input, lineno ) {

	  // remove comments

	  input = input.replace( new RegExp( /^(.*?);.*/ ), "$1" );

	  // trim line

	  input = input.replace( new RegExp( /^\s+/ ), "" );
	  input = input.replace( new RegExp( /\s+$/ ), "" );

	  // Find command or label

	  if( input.match( new RegExp( /^\w+:/ ) ) ) {
		label = input.replace( new RegExp( /(^\w+):.*$/ ), "$1" );
		if( input.match( new RegExp( /^\w+:[\s]*\w+.*$/ ) ) ) {
		  input = input.replace( new RegExp( /^\w+:[\s]*(.*)$/ ), "$1" );
		  command = input.replace( new RegExp( /^(\w+).*$/ ), "$1" );
		} else {
		  command = "";
		}
	  } else {
		command = input.replace( new RegExp( /^(\w+).*$/ ), "$1" );
	  }

	  // Blank line?  Return.

	  if( command == "" )
		return true;

	  command = command.toUpperCase();

	  if( input.match( /^\*[\s]*=[\s]*[\$]?[0-9a-f]*$/ ) ) {
		// equ spotted
		param = input.replace( new RegExp( /^[\s]*\*[\s]*=[\s]*/ ), "" );
		if( param[0] == "$" ) {
		  param = param.replace( new RegExp( /^\$/ ), "" );
		  addr = parseInt( param, 16 );
		} else {
		  addr = parseInt( param, 10 );
		}
		if( (addr < 0) || (addr > 0xffff) ) {
		  message( "Unable to relocate code outside 64k memory" );
		  Materialize.toast('Unable to relocate code outside 64k memory', 3000, 'rounded');
		  return false;
		}
		defaultCodePC = addr;
		return true;
	  }

	  if( input.match( /^\w+\s+.*?$/ ) ) {
		param = input.replace( new RegExp( /^\w+\s+(.*?)/ ), "$1" );
	  } else {
		if( input.match( /^\w+$/ ) ) {
		  param = "";
		} else {
		  return false;
		}
	  }

	  param = param.replace( /[ ]/g, "" );

	  if( command == "DCB" )
		return DCB( param );

	  for( o=0; o<Opcodes.length; o++ ) {
		if( Opcodes[o][0] == command ) {
		  if( checkSingle( param, Opcodes[o][10] ) ) return true;
		  if( checkImmediate( param, Opcodes[o][1] ) ) return true;
		  if( checkZeroPage( param, Opcodes[o][2] ) ) return true;
		  if( checkZeroPageX( param, Opcodes[o][3] ) ) return true;
		  if( checkZeroPageY( param, Opcodes[o][4] ) ) return true;
		  if( checkAbsoluteX( param, Opcodes[o][6] ) ) return true;
		  if( checkAbsoluteY( param, Opcodes[o][7] ) ) return true;
		  if( checkIndirectX( param, Opcodes[o][8] ) ) return true;
		  if( checkIndirectY( param, Opcodes[o][9] ) ) return true;
		  if( checkAbsolute( param, Opcodes[o][5] ) ) return true;
		  if( checkBranch( param, Opcodes[o][11] ) ) return true;
		}
	  }
	  return false; // Unknown opcode
	}

	/*****************************************************************************
	 ****************************************************************************/

	function DCB( param ) {
	  values = param.split( "," );
	  if( values.length == 0 ) return false;
	  for( v=0; v<values.length; v++ ) {
		str = values[v];
		if( str != undefined && str != null && str.length > 0 ) {
		  ch = str.substring( 0, 1 );
		  if( ch == "$" ) {
			number = parseInt( str.replace( /^\$/, "" ), 16 );
			pushByte( number );
		  } else if( ch >= "0" && ch <= "9" ) {
			number = parseInt( str, 10 );
			pushByte( number );
		  } else {
			return false;
		  }
		}
	  }
	  return true;
	}

	/*
	 *  checkBranch() - Commom branch function for all branches (BCC, BCS, BEQ, BNE..)
	 *
	 */

	function checkBranch( param, opcode ) {
	  if( opcode == 0x00 ) return false;

	  addr = -1;
	  if( param.match( /\w+/ ) )
		addr = getLabelPC( param );
	  if( addr == -1 ) { pushWord( 0x00 ); return false; }
	  pushByte( opcode );
	  if( addr < (defaultCodePC-0x600) ) {  // Backwards?
		pushByte( (0xff - ((defaultCodePC-0x600)-addr)) & 0xff );
		return true;
	  }
	  pushByte( (addr-(defaultCodePC-0x600)-1) & 0xff );
	  return true;
	}

	/*
	 * checkImmediate() - Check if param is immediate and push value
	 *
	 */

	function checkImmediate( param, opcode ) {
	  if( opcode == 0x00 ) return false;
	  if( param.match( new RegExp( /^#\$[0-9a-f]{1,2}$/i ) ) ) {
		pushByte( opcode );
		value = parseInt( param.replace( /^#\$/, "" ), 16 );
		if( value < 0 || value > 255 ) return false;
		pushByte( value );
		return true;
	  }
	  if( param.match( new RegExp( /^#[0-9]{1,3}$/i ) ) ) {
		pushByte( opcode );
		value = parseInt( param.replace( /^#/, "" ), 10 );
		if( value < 0 || value > 255 ) return false;
		pushByte( value );
		return true;
	  }
	  // Label lo/hi
	  if( param.match( new RegExp( /^#[<>]\w+$/ ) ) ) {
		label = param.replace( new RegExp( /^#[<>](\w+)$/ ), "$1" );
		hilo = param.replace( new RegExp( /^#([<>]).*$/ ), "$1" );
		pushByte( opcode );
		if( findLabel( label ) ) {
		  addr = getLabelPC( label );
		  switch( hilo ) {
			case ">":
			  pushByte( (addr >> 8) & 0xff );
			  return true;
			  break;
			case "<":
			  pushByte( addr & 0xff );
			  return true;
			  break;
			default:
			  return false;
			  break;
		  }
		} else {
		  pushByte( 0x00 );
		  return true;
		}
	  }
	  return false;
	}

	/*
	 * checkIndZP() - Check indirect ZP
	 *
	 */


	/*
	 * checkIndirectX() - Check if param is indirect X and push value
	 *
	 */

	function checkIndirectX( param, opcode ) {
	  if( opcode == 0x00 ) return false;
	  if( param.match( /^\(\$[0-9a-f]{1,2},X\)$/i ) ) {
		pushByte( opcode );
		value = param.replace( new RegExp( /^\(\$([0-9a-f]{1,2}).*$/i ), "$1" );
		if( value < 0 || value > 255 ) return false;
		pushByte( parseInt( value, 16 ) );
		return true;
	  }
	  return false;
	}

	/*
	 * checkIndirectY() - Check if param is indirect Y and push value
	 *
	 */

	function checkIndirectY( param, opcode ) {
	  if( opcode == 0x00 ) return false;
	  if( param.match( /^\(\$[0-9a-f]{1,2}\),Y$/i ) ) {
		pushByte( opcode );
		value = param.replace( new RegExp( /^\([\$]([0-9a-f]{1,2}).*$/i ), "$1" );
		if( value < 0 || value > 255 ) return false;
		pushByte( parseInt( value, 16 ) );
		return true;
	  }
	  return false;
	}

	/*
	 *  checkSingle() - Single-byte opcodes
	 *
	 */

	function checkSingle( param, opcode ) {
	  if( opcode == 0x00 ) return false;
	  if( param != "" ) return false;
	  pushByte( opcode );
	  return true;
	}

	/*
	 *  checkZeroaPage() - Check if param is ZP and push value
	 *
	 */

	function checkZeroPage( param, opcode ) {
	  if( opcode == 0x00 ) return false;
	  if( param.match( /^\$[0-9a-f]{1,2}$/i ) ) {
		pushByte( opcode );
		value = parseInt( param.replace( /^\$/, "" ), 16 );
		if( value < 0 || value > 255 ) return false;
		pushByte( value );
		return true;
	  }
	  if( param.match( /^[0-9]{1,3}$/i ) ) {
		pushByte( opcode );
		value = parseInt( param, 10 );
		if( value < 0 || value > 255 ) return false;
		pushByte( value );
		return true;
	  }
	  return false;
	}

	/*
	 *  checkAbsoluteX() - Check if param is ABSX and push value
	 *
	 */

	function checkAbsoluteX( param, opcode ) {
	  if( opcode == 0x00 ) return false;
	  if( param.match( /^\$[0-9a-f]{3,4},X$/i ) ) {
		pushByte( opcode );
		number = param.replace( new RegExp( /^\$([0-9a-f]*),X/i ), "$1" );
		value = parseInt( number, 16 );
		if( value < 0 || value > 0xffff ) return false;
		pushWord( value );
		return true;
	  }

	  if( param.match( /^\w+,X$/i ) ) {
		param = param.replace( new RegExp( /,X$/i ), "" );
		pushByte( opcode );
		if( findLabel( param ) ) {
		  addr = getLabelPC( param );
		  if( addr < 0 || addr > 0xffff ) return false;
		  pushWord( addr );
		  return true;
		} else {
		  pushWord( 0x1234 );
		  return true;
		}
	  }

	  return false;
	}

	/*
	 *  checkAbsoluteY() - Check if param is ABSY and push value
	 *
	 */

	function checkAbsoluteY( param, opcode ) {
	  if( opcode == 0x00 ) return false;
	  if( param.match( /^\$[0-9a-f]{3,4},Y$/i ) ) {
		pushByte( opcode );
		number = param.replace( new RegExp( /^\$([0-9a-f]*),Y/i ), "$1" );
		value = parseInt( number, 16 );
		if( value < 0 || value > 0xffff ) return false;
		pushWord( value );
		return true;
	  }

	  // it could be a label too..

	  if( param.match( /^\w+,Y$/i ) ) {
		param = param.replace( new RegExp( /,Y$/i ), "" );
		pushByte( opcode );
		if( findLabel( param ) ) {
		  addr = getLabelPC( param );
		  if( addr < 0 || addr > 0xffff ) return false;
		  pushWord( addr );
		  return true;
		} else {
		  pushWord( 0x1234 );
		  return true;
		}
	  }
	  return false;
	}

	/*
	 *  checkZeroPageX() - Check if param is ZPX and push value
	 *
	 */

	function checkZeroPageX( param, opcode ) {
	  if( opcode == 0x00 ) return false;
	  if( param.match( /^\$[0-9a-f]{1,2},X/i ) ) {
		pushByte( opcode );
		number = param.replace( new RegExp( /^\$([0-9a-f]{1,2}),X/i ), "$1" );
		value = parseInt( number, 16 );
		if( value < 0 || value > 255 ) return false;
		pushByte( value );
		return true;
	  }
	  if( param.match( /^[0-9]{1,3},X/i ) ) {
		pushByte( opcode );
		number = param.replace( new RegExp( /^([0-9]{1,3}),X/i ), "$1" );
		value = parseInt( number, 10 );
		if( value < 0 || value > 255 ) return false;
		pushByte( value );
		return true;
	  }
	  return false;
	}

	function checkZeroPageY( param, opcode ) {
	  if( opcode == 0x00 ) return false;
	  if( param.match( /^\$[0-9a-f]{1,2},Y/i ) ) {
		pushByte( opcode );
		number = param.replace( new RegExp( /^\$([0-9a-f]{1,2}),Y/i ), "$1" );
		value = parseInt( number, 16 );
		if( value < 0 || value > 255 ) return false;
		pushByte( value );
		return true;
	  }
	  if( param.match( /^[0-9]{1,3},Y/i ) ) {
		pushByte( opcode );
		number = param.replace( new RegExp( /^([0-9]{1,3}),Y/i ), "$1" );
		value = parseInt( number, 10 );
		if( value < 0 || value > 255 ) return false;
		pushByte( value );
		return true;
	  }
	  return false;
	}

	/*
	 *  checkAbsolute() - Check if param is ABS and push value
	 *
	 */

	function checkAbsolute( param, opcode ) {
	  if( opcode == 0x00 ) return false;
	  pushByte( opcode );
	  if( param.match( /^\$[0-9a-f]{3,4}$/i ) ) {
		value = parseInt( param.replace( /^\$/, "" ), 16 );
		if( value < 0 || value > 0xffff ) return false;
		pushWord( value );
		return true;
	  }
	  // it could be a label too..
	  if( param.match( /^\w+$/ ) ) {
		if( findLabel( param ) ) {
		  addr = (getLabelPC( param ));
		  if( addr < 0 || addr > 0xffff ) return false;
		  pushWord( addr );
		  return true;
		} else {
		  pushWord( 0x1234 );
		  return true;
		}
	  }
	  return false;
	}

	/*****************************************************************************
	 ****************************************************************************/

	/*
	 *  stackPush() - Push byte to stack
	 *
	 */

	function stackPush( value ) {
	  if( regSP >= 0 ) {
		regSP--;
		memory[(regSP&0xff)+0x100] = value & 0xff;
	  } else {
		message( "Stack full: " + regSP );
		Materialize.toast('Stack full: ' + regSP, 3000, 'rounded');
		codeRunning = false;
	  }
	}

	/*****************************************************************************
	 ****************************************************************************/

	/*
	 *  stackPop() - Pop byte from stack
	 *
	 */

	function stackPop() {
	  if( regSP < 0x100 ) {
		value = memory[regSP+0x100];
		regSP++;
		return value;
	  } else {
		message( "Stack empty" );
		Materialize.toast('Stack empty!', 3000, 'rounded');
		codeRunning = false;
		return 0;
	  }
	}

	/*
	 * pushByte() - Push byte to compiledCode variable
	 *
	 */

	function pushByte( value ) {
	  memory[defaultCodePC] = value & 0xff;
	  defaultCodePC++;
	  codeLen++;
	}

	/*
	 * pushWord() - Push a word using pushByte twice
	 *
	 */

	function pushWord( value ) {
	  pushByte( value & 0xff );
	  pushByte( (value>>8) & 0xff );
	}

	/*
	 * popByte() - Pops a byte
	 *
	 */

	function popByte() {
	  return( memory[regPC++] & 0xff );
	}

	/*
	 * popWord() - Pops a word using popByte() twice
	 *
	 */

	function popWord() {
	  return popByte() + (popByte() << 8);
	}

	/*
	 * memStoreByte() - Poke a byte, don't touch any registers
	 *
	 */

	function memStoreByte( addr, value ) {
	  memory[ addr ] = (value & 0xff);
	  if( (addr >= 0x200) && (addr<=0x5ff) )
		display[addr-0x200].background = palette[memory[addr] & 0x0f];
	}

	/*
	 * memStoreByte() - Peek a byte, don't touch any registers
	 *
	 */

	function memReadByte( addr ) {
	  if( addr == 0xfe ) return Math.floor( Math.random()*256 );
	  return memory[addr];
	}

	/*
	 *  hexDump() - Dump binary as hex to new window
	 *
	 */

	function addr2hex( addr ) {
	  return num2hex((addr>>8)&0xff)+num2hex(addr&0xff);
	}

	function num2hex( nr ) {
	  str = "0123456789abcdef";
	  hi = ((nr&0xf0)>>4);
	  lo = (nr&15);
	  return str.substring( hi, hi+1  ) + str.substring( lo, lo+1 );
	}

	/*
	function hexDump() {
	  w = window.open('', 'hexdump', 'width=500,height=300,resizable=yes,scrollbars=yes,toolbar=no,location=no,menubar=no,status=no' );

	  html = "<html><head>";
	  html += "<link href='style.css' rel='stylesheet' type='text/css' />";
	  html += "<title>hexdump</title></head><body>";
	  html += "<code>";
	  for( x=0; x<codeLen; x++ ) {
		if( (x&15) == 0 ) {
		  html += "<br/> ";
		  n = (0x600+x);
		  html += num2hex( ((n>>8)&0xff) );
		  html += num2hex( (n&0xff) );
		  html += ": ";
		}
		html += num2hex( memory[0x600+x] );
		if( x&1 ) html += " ";
	  }
	  if( (x&1) ) html += "-- [END]";
	  html += "</code></body></html>";
	  w.document.write( html );
	  w.document.close();
	}
	*/

	/*
	 *  runBinary() - Executes the compiled code
	 *
	 */

	function runBinary() {
	  if( codeRunning ) {
		codeRunning = false;
		$('#runButton').html('Run');
	//    document.getElementById( "hexdumpButton" ).disabled = false;
	//    document.getElementById( "submitCode" ).disabled = false;
		clearInterval( myInterval );
	  } else {
		//reset();
		$('#runButton').html('Stop');
	//    document.getElementById( "hexdumpButton" ).disabled = true;
	//    document.getElementById( "submitCode" ).disabled = true;
		codeRunning = true;
		myInterval = setInterval(function() { multiexecute() }, 1 );
		//execute();
	  }
	}

	/*
	 *  readZeroPage() - Get value from ZP
	 *
	 */

	function jumpBranch( offset ) {
	  if( offset > 0x7f )
		regPC = (regPC - (0x100 - offset));
	  else
		regPC = (regPC + offset );
	}

	function doCompare( reg, val ) {
	  if( (reg+val) > 0xff ) regP |= 1; else regP &= 0xfe;
	  val = (reg-val);
	//  if( reg+0x100-val > 0xff ) regP |= 1; else regP &= 0xfe;
	//  val = reg+0x100-val;
	  if( val ) regP &= 0xfd; else regP |= 0x02;
	  if( val & 0x80 ) regP |= 0x80; else regP &= 0x7f;
	}

	function testSBC( value ) {
	  if( (regA ^ value ) & 0x80 )
		vflag = 1;
	  else
		vflag = 0;

	  if( regP & 8 ) {
		tmp = 0xf + (regA & 0xf) - (value & 0xf) + (regP&1);
		if( tmp < 0x10 ) {
		  w = 0;
		  tmp -= 6;
		} else {
		  w = 0x10;
		  tmp -= 0x10;
		}
		w += 0xf0 + (regA & 0xf0) - (value & 0xf0);
		if( w < 0x100 ) {
		  regP &= 0xfe;
		  if( (regP&0xbf) && w<0x80) regP&=0xbf;
		  w -= 0x60;
		} else {
		  regP |= 1;
		  if( (regP&0xbf) && w>=0x180) regP&=0xbf;
		}
		w += tmp;
	  } else {
		w = 0xff + regA - value + (regP&1);
		if( w<0x100 ) {
		  regP &= 0xfe;
		  if( (regP&0xbf) && w<0x80 ) regP&=0xbf;
		} else {
		  regP |= 1;
		  if( (regP&0xbf) && w>= 0x180) regP&=0xbf;
		}
	  }
	  regA = w & 0xff;
	  if( regA ) regP &= 0xfd; else regP |= 0x02;
	  if( regA & 0x80 ) regP |= 0x80; else regP &= 0x7f;
	}

	function testADC( value ) {
	  if( (regA ^ value) & 0x80 ) {
		regP &= 0xbf;
	  } else {
		regP |= 0x40;
	  }

	  if( regP & 8 ) {
		tmp = (regA & 0xf) + (value & 0xf) + (regP&1);
		if( tmp >= 10 ) {
		  tmp = 0x10 | ((tmp+6)&0xf);
		}
		tmp += (regA & 0xf0) + (value & 0xf0);
		if( tmp >= 160) {
		  regP |= 1;
		  if( (regP&0xbf) && tmp >= 0x180 ) regP &= 0xbf;
		  tmp += 0x60;
		} else {
		  regP &= 0xfe;
		  if( (regP&0xbf) && tmp<0x80 ) regP &= 0xbf;
		}
	  } else {
		tmp = regA + value + (regP&1);
		if( tmp >= 0x100 ) {
		  regP |= 1;
		  if( (regP&0xbf) && tmp>=0x180) regP &= 0xbf;
		} else {
		  regP &= 0xfe;
		  if( (regP&0xbf) && tmp<0x80) regP &= 0xbf;
		}
	  }
	  regA = tmp & 0xff;
	  if( regA ) regP &= 0xfd; else regP |= 0x02;
	  if( regA & 0x80 ) regP |= 0x80; else regP &= 0x7f;
	}

	function multiexecute() {
	  for( w=0; w<128; w++ ) execute();
	}

	/*
	 *  execute() - Executes one instruction.
	 *              This is the main part of the CPU emulator.
	 *
	 */

	function execute() {
	  if( ! codeRunning ) return;

	  opcode = popByte();
	  switch( opcode ) {
		case 0x00:                            // BRK implied
		  codeRunning = false;
		  break;
		case 0x01:                            // ORA INDX
		  addr = popByte() + regX;
		  value = memReadByte( addr ) + (memReadByte( addr+1) << 8);
		  regA |= value;
		  if( regA ) regP &= 0xfd; else regP |= 0x02;
		  if( regA & 0x80 ) regP |= 0x80; else regP &= 0x7f;
		  break;
		case 0x05:                            // ORA ZP
		  zp = popByte();
		  regA |= memReadByte( zp );
		  if( regA ) regP &= 0xfd; else regP |= 0x02;
		  if( regA & 0x80 ) regP |= 0x80; else regP &= 0x7f;
		  break;
		case 0x06:                            // ASL ZP
		  zp = popByte();
		  value = memReadByte( zp );
		  regP = (regP & 0xfe) | ((value>>7)&1);
		  value = value << 1;
		  memStoreByte( zp, value );
		  if( value ) regP &= 0xfd; else regP |= 0x02;
		  if( value & 0x80 ) regP |= 0x80; else regP &= 0x7f;
		  break;
		case 0x08:                            // PHP
		  stackPush( regP );
		  break;
		case 0x09:                            // ORA IMM
		  regA |= popByte();
		  if( regA ) regP &= 0xfd; else regP |= 0x02;
		  if( regA & 0x80 ) regP |= 0x80; else regP &= 0x7f;
		  break;
		case 0x0a:                            // ASL IMPL
		  regP = (regP & 0xfe) | ((regA>>7)&1);
		  regA = regA<<1;
		  if( regA ) regP &= 0xfd; else regP |= 0x02;
		  if( regA & 0x80 ) regP |= 0x80; else regP &= 0x7f;
		  break;
		case 0x0d:                            // ORA ABS
		  regA |= memReadByte( popWord() );
		  if( regA ) regP &= 0xfd; else regP |= 0x02;
		  if( regA & 0x80 ) regP |= 0x80; else regP &= 0x7f;
		  break;
		case 0x0e:                            // ASL ABS
		  addr = popWord();
		  value = memReadByte( addr );
		  regP = (regP & 0xfe) | ((value>>7)&1);
		  value = value << 1;
		  memStoreByte( addr, value );
		  if( value ) regP &= 0xfd; else regP |= 2;
		  if( value & 0x80 ) regP |= 0x80; else regP &= 0x7f;
		  break;
		case 0x10:                            // BPL
		  offset = popByte();
		  if( (regP & 0x80) == 0 ) jumpBranch( offset );
		  break;
		case 0x11:                            // ORA INDY
		  zp = popByte();
		  value = memReadByte(zp) + (memReadByte(zp+1)<<8) + regY;
		  regA |= memReadByte(value);
		  if( regA ) regP &= 0xfd; else regP |= 0x02;
		  if( regA & 0x80 ) regP |= 0x80; else regP &= 0x7f;
		  break;
		case 0x15:                            // ORA ZPX
		  addr = (popByte() + regX) & 0xff;
		  regA |= memReadByte(addr);
		  if( regA ) regP &= 0xfd; else regP |= 0x02;
		  if( regA & 0x80 ) regP |= 0x80; else regP &= 0x7f;
		  break;
		case 0x16:                            // ASL ZPX
		  addr = (popByte() + regX) & 0xff;
		  value = memReadByte(addr);
		  regP = (regP & 0xfe) | ((value>>7)&1);
		  value = value << 1;
		  memStoreByte( addr, value );
		  if( value ) regP &= 0xfd; else regP |= 0x02;
		  if( value & 0x80 ) regP |= 0x80; else regP &= 0x7f;
		  break;
		case 0x18:                            // CLC
		  regP &= 0xfe;
		  break;
		case 0x19:                            // ORA ABSY
		  addr = popWord() + regY;
		  regA |= memReadByte( addr );
		  if( regA ) regP &= 0xfd; else regP |= 0x02;
		  if( regA & 0x80 ) regP |= 0x80; else regP &= 0x7f;
		  break;
		case 0x1d:                            // ORA ABSX
		  addr = popWord() + regX;
		  regA |= memReadByte( addr );
		  if( regA ) regP &= 0xfd; else regP |= 0x02;
		  if( regA & 0x80 ) regP |= 0x80; else regP &= 0x7f;
		  break;
		case 0x1e:                            // ASL ABSX
		  addr = popWord() + regX;
		  value = memReadByte( addr );
		  regP = (regP & 0xfe) | ((value>>7)&1);
		  value = value << 1;
		  memStoreByte( addr, value );
		  if( value ) regP &= 0xfd; else regP |= 0x02;
		  if( value & 0x80 ) regP |= 0x80; else regP &= 0x7f;
		  break;
		case 0x20:                            // JSR ABS
		  addr = popWord();
		  currAddr = regPC-1;
		  stackPush( ((currAddr >> 8) & 0xff) );
		  stackPush( (currAddr & 0xff) );
		  regPC = addr;
		  break;
		case 0x21:                            // AND INDX
		  addr = (popByte() + regX)&0xff;
		  value = memReadByte( addr ) + (memReadByte( addr+1) << 8);
		  regA &= value;
		  if( regA ) regP &= 0xfd; else regP |= 0x02;
		  if( regA & 0x80 ) regP |= 0x80; else regP &= 0x7f;
		  break;
		case 0x24:                            // BIT ZP
		  zp = popByte();
		  value = memReadByte( zp );
		  if( value & regA ) regP &= 0xfd; else regP |= 0x02;
		  regP = (regP & 0x3f) | (value & 0xc0);
		  break;
		case 0x25:                            // AND ZP
		  zp = popByte();
		  regA &= memReadByte( zp );
		  if( regA ) regP &= 0xfd; else regP |= 2;
		  if( regA & 0x80 ) regP &= 0x80; else regP &= 0x7f;
		  break;
		case 0x26:                            // ROL ZP
		  sf = (regP & 1);
		  addr = popByte();
		  value = memReadByte( addr ); //  & regA;  -- Thanks DMSC ;)
		  regP = (regP & 0xfe) | ((value>>7)&1);
		  value = value << 1;
		  value |= sf;
		  memStoreByte( addr, value );
		  if( value ) regP &= 0xfd; else regP |= 0x02;
		  if( value & 0x80 ) regP |= 0x80; else regP &= 0x7f;
		  break;
		case 0x28:                            // PLP
		  regP = stackPop() | 0x20;
		  break;
		case 0x29:                            // AND IMM
		  regA &= popByte();
		  if( regA ) regP &= 0xfd; else regP |= 0x02;
		  if( regA & 0x80 ) regP |= 0x80; else regP &= 0x7f;
		  break;
		case 0x2a:                            // ROL A
		  sf = (regP&1);
		  regP = (regP&0xfe) | ((regA>>7)&1);
		  regA = regA << 1;
		  regA |= sf;
		  if( regA ) regP &= 0xfd; else regP |= 0x02;
		  if( regA & 0x80 ) regP |= 0x80; else regP &= 0x7f;
		  break;
		case 0x2c:                            // BIT ABS
		  value = memReadByte( popWord() );
		  if( value & regA ) regP &= 0xfd; else regP |= 0x02;
		  regP = (regP & 0x3f) | (value & 0xc0);
		  break;
		case 0x2d:                            // AND ABS
		  value = memReadByte( popWord() );
		  regA &= value;
		  if( regA ) regP &= 0xfd; else regP |= 0x02;
		  if( regA & 0x80 ) regP |= 0x80; else regP &= 0x7f;
		  break;
		case 0x2e:                            // ROL ABS
		  sf = regP & 1;
		  addr = popWord();
		  value = memReadByte( addr );
		  regP = (regP & 0xfe) | ((value>>7)&1);
		  value = value << 1;
		  value |= sf;
		  memStoreByte( addr, value );
		  if( value ) regP &= 0xfd; else regP |= 0x02;
		  if( value & 0x80 ) regP |= 0x80; else regP &= 0x7f;
		  break;
		case 0x30:                            // BMI
		  offset = popByte();
		  if( regP & 0x80 ) jumpBranch( offset );
		  break;
		case 0x31:                            // AND INDY
		  zp = popByte();
		  value = memReadByte(zp) + (memReadByte(zp+1)<<8) + regY;
		  regA &= memReadByte(value);
		  if( regA ) regP &= 0xfd; else regP |= 0x02;
		  if( regA & 0x80 ) regP |= 0x80; else regP &= 0x7f;
		  break;
		case 0x35:                            // AND INDX
		  zp = popByte();
		  value = memReadByte(zp) + (memReadByte(zp+1)<<8) + regX;
		  regA &= memReadByte(value);
		  if( regA ) regP &= 0xfd; else regP |= 0x02;
		  if( regA & 0x80 ) regP |= 0x80; else regP &= 0x7f;
		  break;
		case 0x36:                            // ROL ZPX
		  sf = regP & 1;
		  addr = (popByte() + regX) & 0xff;
		  value = memReadByte( addr );
		  regP = (regP & 0xfe) | ((value>>7)&1);
		  value = value << 1;
		  value |= sf;
		  memStoreByte( addr, value );
		  if( value ) regP &= 0xfd; else regP |= 0x02;
		  if( value & 0x80 ) regP |= 0x80; else regP &= 0x7f;
		  break;
		case 0x38:                            // SEC
		  regP |= 1;
		  break;
		case 0x39:                            // AND ABSY
		  addr = popWord() + regY;
		  value = memReadByte( addr );
		  regA &= value;
		  if( regA ) regP &= 0xfd; else regP |= 0x02;
		  if( regA & 0x80 ) regP |= 0x80; else regP &= 0x7f;
		  break;
		case 0x3d:                            // AND ABSX
		  addr = popWord() + regX;
		  value = memReadByte( addr );
		  regA &= value;
		  if( regA ) regP &= 0xfd; else regP |= 0x02;
		  if( regA & 0x80 ) regP |= 0x80; else regP &= 0x7f;
		  break;
		case 0x3e:                            // ROL ABSX
		  sf = regP&1;
		  addr = popWord() + regX;
		  value = memReadByte( addr );
		  regP = (regP & 0xfe) | ((value>>7)&1);
		  value = value << 1;
		  value |= sf;
		  memStoreByte( addr, value );
		  if( value ) regP &= 0xfd; else regP |= 0x02;
		  if( value & 0x80 ) regP |= 0x80; else regP &= 0x7f;
		  break;
		case 0x40:                            // RTI (unsupported, =NOP)
		  break;
		case 0x41:                            // EOR INDX
		  zp = (popByte() + regX)&0xff;
		  value = memReadByte(zp) + (memReadByte(zp+1)<<8);
		  regA ^= memReadByte(value);
		  if( regA ) regP &= 0xfd; else regP |= 0x02;
		  if( regA & 0x80 ) regP |= 0x80; else regP &= 0x7f;
		  break;
		case 0x45:                            // EOR ZPX
		  addr = (popByte() + regX) & 0xff;
		  value = memReadByte( addr );
		  regA ^= value;
		  if( regA ) regP &= 0xfd; else regP |= 0x02;
		  if( regA & 0x80 ) regP |= 0x80; else regP &= 0x7f;
		  break;
		case 0x46:                            // LSR ZP
		  addr = popByte() & 0xff;
		  value = memReadByte( addr );
		  regP = (regP & 0xfe) | (value&1);
		  value = value >> 1;
		  memStoreByte( addr, value );
		  if( value != 0 ) regP &= 0xfd; else regP |= 2;
		  if( (value&0x80) == 0x80 ) regP |= 0x80; else regP &= 0x7f;
		  break;
		case 0x48:                            // PHA
		  stackPush( regA );
		  break;
		case 0x49:                            // EOR IMM
		  regA ^= popByte();
		  if( regA ) regP &= 0xfd; else regP |= 0x02;
		  if( regA & 0x80 ) regP |= 0x80; else regP &= 0x7f;
		  break;
		case 0x4a:                            // LSR
		  regP = (regP&0xfe) | (regA&1);
		  regA = regA >> 1;
		  if( regA ) regP &= 0xfd; else regP |= 0x02;
		  if( regA & 0x80 ) regP |= 0x80; else regP &= 0x7f;
		  break;
		case 0x4c:                            // JMP abs
		  regPC = popWord();
		  break;
		case 0x4d:                            // EOR abs
		  addr = popWord();
		  value = memReadByte( addr );
		  regA ^= value;
		  if( regA ) regP &= 0xfd; else regP |= 0x02;
		  if( regA & 0x80 ) regP |= 0x80; else regP &= 0x7f;
		  break;
		case 0x4e:                           // LSR abs
		  addr = popWord();
		  value = memReadByte( addr );
		  regP = (regP&0xfe)|(value&1);
		  value = value >> 1;
		  memStoreByte( addr, value );
		  if( value ) regP &= 0xfd; else regP |= 0x02;
		  if( value & 0x80 ) regP |= 0x80; else regP &= 0x7f;
		  break;
		case 0x50:                           // BVC (on overflow clear)
		  offset = popByte();
		  if( (regP & 0x40) == 0 ) jumpBranch( offset );
		  break;
		case 0x51:                           // EOR INDY
		  zp = popByte();
		  value = memReadByte(zp) + (memReadByte(zp+1)<<8) + regY;
		  regA ^= memReadByte(value);
		  if( regA ) regP &= 0xfd; else regP |= 0x02;
		  if( regA & 0x80 ) regP |= 0x80; else regP &= 0x7f;
		  break;
		case 0x55:                           // EOR ZPX
		  addr = (popByte() + regX) & 0xff;
		  regA ^= memReadByte( addr );
		  if( regA ) regP &= 0xfd; else regP |= 0x02;
		  if( regA & 0x80 ) regP |= 0x80; else regP &= 0x7f;
		  break;
		case 0x56:                           // LSR ZPX
		  addr = (popByte() + regX) & 0xff;
		  value = memReadByte( addr );
		  regP = (regP&0xfe) | (value&1);
		  value = value >> 1;
		  memStoreByte( addr, value );
		  if( value ) regP &= 0xfd; else regP |= 0x02;
		  if( value & 0x80 ) regP |= 0x80; else regP &= 0x7f;
		  break;
		case 0x58:                           // CLI (does nothing)
		  break;
		case 0x59:                           // EOR ABSY
		  addr = popWord() + regY;
		  value = memReadByte( addr );
		  regA ^= value;
		  if( regA ) regP &= 0xfd; else regP |= 0x02;
		  if( regA & 0x80 ) regP |= 0x80; else regP &= 0x7f;
		  break;
		case 0x5d:                           // EOR ABSX
		  addr = popWord() + regX;
		  value = memReadByte( addr );
		  regA ^= value;
		  if( regA ) regP &= 0xfd; else regP |= 0x02;
		  if( regA & 0x80 ) regP |= 0x80; else regP &= 0x7f;
		  break;
		case 0x5e:                           // LSR ABSX
		  addr = popWord() + regX;
		  value = memReadByte( addr );
		  regP = (regP&0xfe) | (value&1);
		  value = value >> 1;
		  memStoreByte( addr, value );
		  if( value ) regP &= 0xfd; else regP |= 0x02;
		  if( value & 0x80 ) regP |= 0x80; else regP &= 0x7f;
		  break;
		case 0x60:                           // RTS
		  regPC = (stackPop()+1) | (stackPop()<<8);
		  break;
		case 0x61:                           // ADC INDX
		  zp = (popByte() + regX)&0xff;
		  addr = memReadByte(zp) + (memReadByte(zp+1)<<8);
		  value = memReadByte( addr );
		  testADC( value );
		  break;
		case 0x65:                           // ADC ZP
		  addr = popByte();
		  value = memReadByte( addr );
		  testADC( value );
		  break;
		case 0x66:                           // ROR ZP
		  sf = regP&1;
		  addr = popByte();
		  value = memReadByte( addr );
		  regP = (regP&0xfe)|(value&1);
		  value = value >> 1;
		  if( sf ) value |= 0x80;
		  memStoreByte( addr, value );
		  if( value ) regP &= 0xfd; else regP |= 0x02;
		  if( value & 0x80 ) regP |= 0x80; else regP &= 0x7f;
		  break;
		case 0x68:                           // PLA
		  regA = stackPop();
		  if( regA ) regP &= 0xfd; else regP |= 0x02;
		  if( regA & 0x80 ) regP |= 0x80; else regP &= 0x7f;
		  break;
		case 0x69:                           // ADC IMM
		  value = popByte();
		  testADC( value );
		  break;
		case 0x6a:                           // ROR A
		  sf = regP&1;
		  regP = (regP&0xfe) | (regA&1);
		  regA = regA >> 1;
		  if( sf ) regA |= 0x80;
		  if( regA ) regP &= 0xfd; else regP |= 0x02;
		  if( regA & 0x80 ) regP |= 0x80; else regP &= 0x7f;
		  break;
		case 0x6c: // JMP INDIR
	//      regPC = memReadByte(popByte()) + (memReadByte(popByte())<<8);
		  break;
		case 0x6d:                           // ADC ABS
		  addr = popWord();
		  value = memReadByte( addr );
		  testADC( value );
		  break;
		case 0x6e:                           // ROR ABS
		  sf = regP&1;
		  addr = popWord();
		  value = memReadByte( addr );
		  regP = (regP&0xfe)|(value&1);
		  value = value >> 1;
		  if( sf ) value |= 0x80;
		  memStoreByte( addr, value );
		  if( value ) regP &= 0xfd; else regP |= 0x02;
		  if( value & 0x80 ) regP |= 0x80; else regP &= 0x7f;
		  break;
		case 0x70:                           // BVS (branch on overflow set)
		  offset = popByte();
		  if( regP & 0x40 ) jumpBranch( offset );
		  break;
		case 0x71:                           // ADC INY
		  zp = popByte();
		  addr = memReadByte(zp) + (memReadByte(zp+1)<<8);
		  value = memReadByte( addr + regY );
		  testADC( value );
		  break;
		case 0x75:                           // ADC ZPX
		  addr = (popByte() + regX) & 0xff;
		  value = memReadByte( addr );
		  regP = (regP&0xfe) | (value&1);
		  testADC( value );
		  break;
		case 0x76:                           // ROR ZPX
		  sf = (regP&1);
		  addr = (popByte() + regX) & 0xff;
		  value = memReadByte( addr );
		  regP = (regP&0xfe) | (value&1);
		  value = value >> 1;
		  if( sf ) value |= 0x80;
		  memStoreByte( addr, value );
		  if( value ) regP &= 0xfd; else regP |= 0x02;
		  if( value & 0x80 ) regP |= 0x80; else regP &= 0x7f;
		  break;
		case 0x78:                           // SEI (does nothing)
		  break;
		case 0x79:                           // ADC ABSY
		  addr = popWord();
		  value = memReadByte( addr + regY );
		  testADC( value );
		  break;
		case 0x7d:                           // ADC ABSX
		  addr = popWord();
		  value = memReadByte( addr + regX );
		  testADC( value );
		  break;
		case 0x7e:                           // ROR ABSX
		  sf = regP&1;
		  addr = popWord() + regX;
		  value = memReadByte( addr );
		  regP = (regP&0xfe) | (value&1);
		  value = value >> 1;
		  if( value ) value |= 0x80;
		  memStoreByte( addr, value );
		  if( value ) regP &= 0xfd; else regP |= 0x02;
		  if( value & 0x80 ) regP |= 0x80; else regP &= 0x7f;
		  break;
		case 0x81:                           // STA INDX
		  zp = (popByte()+regX)&0xff;
		  addr = memReadByte(zp) + (memReadByte(zp+1)<<8);
		  memStoreByte( addr, regA );
		  break;
		case 0x84:                           // STY ZP
		  memStoreByte( popByte(), regY );
		  break;
		case 0x85:                           // STA ZP
		  memStoreByte( popByte(), regA );
		  break;
		case 0x86:                           // STX ZP
		  memStoreByte( popByte(), regX );
		  break;
		case 0x88:                           // DEY (1 byte)
		  regY = (regY-1) & 0xff;
		  if( regY ) regP &= 0xfd; else regP |= 0x02;
		  if( regY & 0x80 ) regP |= 0x80; else regP &= 0x7f;
		  break;
		case 0x8a:                           // TXA (1 byte);
		  regA = regX & 0xff;
		  if( regA ) regP &= 0xfd; else regP |= 0x02;
		  if( regA & 0x80 ) regP |= 0x80; else regP &= 0x7f;
		  break;
		case 0x8c:                           // STY abs
		  memStoreByte( popWord(), regY );
		  break;
		case 0x8d:                           // STA ABS (3 bytes)
		  memStoreByte( popWord(), regA );
		  break;
		case 0x8e:                           // STX abs
		  memStoreByte( popWord(), regX );
		  break;
		case 0x90:                           // BCC (branch on carry clear)
		  offset = popByte();
		  if( ( regP & 1 ) == 0 ) jumpBranch( offset );
		  break;
		case 0x91:                           // STA INDY
		  zp = popByte();
		  addr = memReadByte(zp) + (memReadByte(zp+1)<<8) + regY;
		  memStoreByte( addr, regA );
		  break;
		case 0x94:                           // STY ZPX
		  memStoreByte( popByte() + regX, regY );
		  break;
		case 0x95:                           // STA ZPX
		  memStoreByte( popByte() + regX, regA );
		  break;
		case 0x96:                           // STX ZPY
		  memStoreByte( popByte() + regY, regX );
		  break;
		case 0x98:                           // TYA
		  regA = regY & 0xff;
		  if( regA ) regP &= 0xfd; else regP |= 0x02;
		  if( regA & 0x80 ) regP |= 0x80; else regP &= 0x7f;
		  break;
		case 0x99:                           // STA ABSY
		  memStoreByte( popWord() + regY, regA );
		  break;
		case 0x9a:                           // TXS
		  regSP = regX & 0xff;
		  break;
		case 0x9d:                           // STA ABSX
		  addr = popWord();
		  memStoreByte( addr + regX, regA );
		  break;
		case 0xa0:                           // LDY IMM
		  regY = popByte();
		  if( regY ) regP &= 0xfd; else regP |= 0x02;
		  if( regY & 0x80 ) regP |= 0x80; else regP &= 0x7f;
		  break;
		case 0xa1:                           // LDA INDX
		  zp = (popByte()+regX)&0xff;
		  addr = memReadByte(zp) + (memReadByte(zp+1)<<8);
		  regA = memReadByte( addr );
		  if( regA ) regP &= 0xfd; else regP |= 0x02;
		  if( regA & 0x80 ) regP |= 0x80; else regP &= 0x7f;
		  break;
		case 0xa2:                           // LDX IMM
		  regX = popByte();
		  if( regX ) regP &= 0xfd; else regP |= 0x02;
		  if( regX & 0x80 ) regP |= 0x80; else regP &= 0x7f;
		  break;
		case 0xa4:                           // LDY ZP
		  regY = memReadByte( popByte() );
		  if( regY ) regP &= 0xfd; else regP |= 0x02;
		  if( regY & 0x80 ) regP |= 0x80; else regP &= 0x7f;
		  break;
		case 0xa5:                           // LDA ZP
		  regA = memReadByte( popByte() );
		  if( regA ) regP &= 0xfd; else regP |= 0x02;
		  if( regA & 0x80 ) regP |= 0x80; else regP &= 0x7f;
		  break;
		case 0xa6:                          // LDX ZP
		  regX = memReadByte( popByte() );
		  if( regX ) regP &= 0xfd; else regP |= 0x02;
		  if( regX & 0x80 ) regP |= 0x80; else regP &= 0x7f;
		  break;
		case 0xa8:                          // TAY
		  regY = regA & 0xff;
		  if( regY ) regP &= 0xfd; else regP |= 0x02;
		  if( regY & 0x80 ) regP |= 0x80; else regP &= 0x7f;
		  break;
		case 0xa9:                          // LDA IMM
		  regA = popByte();
		  if( regA ) regP &= 0xfd; else regP |= 0x02;
		  if( regA & 0x80 ) regP |= 0x80; else regP &= 0x7f;
		  break;
		case 0xaa:                          // TAX
		  regX = regA & 0xff;
		  if( regX ) regP &= 0xfd; else regP |= 0x02;
		  if( regX & 0x80 ) regP |= 0x80; else regP &= 0x7f;
		  break;
		case 0xac:                          // LDY ABS
		  regY = memReadByte( popWord() );
		  if( regY ) regP &= 0xfd; else regP |= 0x02;
		  if( regY & 0x80 ) regP |= 0x80; else regP &= 0x7f;
		  break;
		case 0xad:                          // LDA ABS
		  regA = memReadByte( popWord() );
		  if( regA ) regP &= 0xfd; else regP |= 0x02;
		  if( regA & 0x80 ) regP |= 0x80; else regP &= 0x7f;
		  break;
		case 0xae:                          // LDX ABS
		  regX = memReadByte( popWord() );
		  if( regX ) regP &= 0xfd; else regP |= 0x02;
		  if( regX & 0x80 ) regP |= 0x80; else regP &= 0x7f;
		  break;
		case 0xb0:                          // BCS
		  offset = popByte();
		  if( regP & 1 ) jumpBranch( offset );
		  break;
		case 0xb1:                          // LDA INDY
		  zp = popByte();
		  addr = memReadByte(zp) + (memReadByte(zp+1)<<8) + regY;
		  regA = memReadByte( addr );
		  if( regA ) regP &= 0xfd; else regP |= 0x02;
		  if( regA & 0x80 ) regP |= 0x80; else regP &= 0x7f;
		  break;
		case 0xb4:                          // LDY ZPX
		  regY = memReadByte( popByte() + regX );
		  if( regY ) regP &= 0xfd; else regP |= 0x02;
		  if( regY & 0x80 ) regP |= 0x80; else regP &= 0x7f;
		  break;
		case 0xb5:                          // LDA ZPX
		  regA = memReadByte( (popByte() + regX) & 0xff );
		  if( regA ) regP &= 0xfd; else regP |= 0x02;
		  if( regA & 0x80 ) regP |= 0x80; else regP &= 0x7f;
		  break;
		case 0xb6:                          // LDX ZPY
		  regX = memReadByte( popByte() + regY );
		  if( regX ) regP &= 0xfd; else regP |= 0x02;
		  if( regX & 0x80 ) regP |= 0x80; else regP &= 0x7f;
		  break;
		case 0xb8:                          // CLV
		  regP &= 0xbf;
		  break;
		case 0xb9:                          // LDA ABSY
		  addr = popWord() + regY;
		  regA = memReadByte( addr );
		  if( regA ) regP &= 0xfd; else regP |= 0x02;
		  if( regA & 0x80 ) regP |= 0x80; else regP &= 0x7f;
		  break;
		case 0xba:                          // TSX
		  regX = regSP & 0xff;
		  break;
		case 0xbc:                          // LDY ABSX
		  addr = popWord() + regX;
		  regY = memReadByte( addr );
		  if( regY ) regP &= 0xfd; else regP |= 0x02;
		  if( regY & 0x80 ) regP |= 0x80; else regP &= 0x7f;
		  break;
		case 0xbd:                          // LDA ABSX
		  addr = popWord() + regX;
		  regA = memReadByte( addr );
		  if( regA ) regP &= 0xfd; else regP |= 0x02;
		  if( regA & 0x80 ) regP |= 0x80; else regP &= 0x7f;
		  break;
		case 0xbe:                          // LDX ABSY
		  addr = popWord() + regY;
		  regX = memReadByte( addr );
		  if( regX ) regP &= 0xfd; else regP |= 0x02;
		  if( regX & 0x80 ) regP |= 0x80; else regP &= 0x7f;
		  break;
		case 0xc0:                          // CPY IMM
		  value = popByte();
		  if( (regY+value) > 0xff ) regP |= 1; else regP &= 0xfe;
		  ov = value;
		  value = (regY-value);
		  if( value ) regP &= 0xfd; else regP |= 0x02;
		  if( value & 0x80 ) regP |= 0x80; else regP &= 0x7f;
		  break;
		case 0xc1:                          // CMP INDY
		  zp = popByte();
		  addr = memReadByte(zp) + (memReadByte(zp+1)<<8) + regY;
		  value = memReadByte( addr );
		  doCompare( regA, value );
		  break;
		case 0xc4:                          // CPY ZP
		  value = memReadByte( popByte() );
		  doCompare( regY, value );
		  break;
		case 0xc5:                          // CMP ZP
		  value = memReadByte( popByte() );
		  doCompare( regA, value );
		  break;
		case 0xc6:                          // DEC ZP
		  zp = popByte();
		  value = memReadByte( zp );
		  --value;
		  memStoreByte( zp, value&0xff );
		  if( value ) regP &= 0xfd; else regP |= 0x02;
		  if( value & 0x80 ) regP |= 0x80; else regP &= 0x7f;
		  break;
		case 0xc8:                          // INY
		  regY = (regY + 1) & 0xff;
		  if( regY ) regP &= 0xfd; else regP |= 0x02;
		  if( regY & 0x80 ) regP |= 0x80; else regP &= 0x7f;
		  break;
		case 0xc9:                          // CMP IMM
		  value = popByte();
		  doCompare( regA, value );
		  break;
		case 0xca:                          // DEX
		  regX = (regX-1) & 0xff;
		  if( regX ) regP &= 0xfd; else regP |= 0x02;
		  if( regX & 0x80 ) regP |= 0x80; else regP &= 0x7f;
		  break;
		case 0xcc:                          // CPY ABS
		  value = memReadByte( popWord() );
		  doCompare( regY, value );
		  break;
		case 0xcd:                          // CMP ABS
		  value = memReadByte( popWord() );
		  doCompare( regA, value );
		  break;
		case 0xce:                          // DEC ABS
		  addr = popWord();
		  value = memReadByte( addr );
		  --value;
		  value = value&0xff;
		  memStoreByte( addr, value );
		  if( value ) regP &= 0xfd; else regP |= 0x02;
		  if( value & 0x80 ) regP |= 0x80; else regP &= 0x7f;
		  break;
		case 0xd0:                          // BNE
		  offset = popByte();
	//      if( (regP&2)==0 ) { oldPC = regPC; jumpBranch( offset ); message( "Jumping from " + addr2hex(oldPC) + " to " + addr2hex(regPC) ); } else { message( "NOT jumping!" ); }
		  if( (regP&2)==0 ) jumpBranch( offset );
		  break;
		case 0xd1:                          // CMP INDY
		  zp = popByte();
		  addr = memReadByte(zp) + (memReadByte(zp+1)<<8) + regY;
		  value = memReadByte( addr );
		  doCompare( regA, value );
		  break;
		case 0xd5:                          // CMP ZPX
		  value = memReadByte( popByte() + regX );
		  doCompare( regA, value );
		  break;
		case 0xd6:                          // DEC ZPX
		  addr = popByte() + regX;
		  value = memReadByte( addr );
		  --value;
		  value = value&0xff;
		  memStoreByte( addr, value );
		  if( value ) regP &= 0xfd; else regP |= 0x02;
		  if( value & 0x80 ) regP |= 0x80; else regP &= 0x7f;
		  break;
		case 0xd8:                          // CLD (CLear Decimal)
		  regP &= 0xf7;
		  break;
		case 0xd9:                          // CMP ABSY
		  addr = popWord() + regY;
		  value = memReadByte( addr );
		  doCompare( regA, value );
		  break;
		case 0xdd:                          // CMP ABSX
		  addr = popWord() + regX;
		  value = memReadByte( addr );
		  doCompare( regA, value );
		  break;
		case 0xde:                          // DEC ABSX
		  addr = popWord() + regX;
		  value = memReadByte( addr );
		  --value;
		  value = value&0xff;
		  memStoreByte( addr, value );
		  if( value ) regP &= 0xfd; else regP |= 0x02;
		  if( value & 0x80 ) regP |= 0x80; else regP &= 0x7f;
		  break;
		case 0xe0:                          // CPX IMM
		  value = popByte();
		  doCompare( regX, value );
		  break;
		case 0xe1:                          // SBC INDX
		  zp = (popByte()+regX)&0xff;
		  addr = memReadByte(zp) + (memReadByte(zp+1)<<8);
		  value = memReadByte( addr );
		  testSBC( value );
		  break;
		case 0xe4:                          // CPX ZP
		  value = memReadByte( popByte() );
		  doCompare( regX, value );
		  break;
		case 0xe5:                          // SBC ZP
		  addr = popByte();
		  value = memReadByte( addr );
		  testSBC( value );
		  break;
		case 0xe6:                          // INC ZP
		  zp = popByte();
		  value = memReadByte( zp );
		  ++value;
		  value = (value)&0xff;
		  memStoreByte( zp, value );
		  if( value ) regP &= 0xfd; else regP |= 0x02;
		  if( value & 0x80 ) regP |= 0x80; else regP &= 0x7f;
		  break;
		case 0xe8:                          // INX
		  regX = (regX + 1) & 0xff;
		  if( regX ) regP &= 0xfd; else regP |= 0x02;
		  if( regX & 0x80 ) regP |= 0x80; else regP &= 0x7f;
		  break;
		case 0xe9:                         // SBC IMM
		  value = popByte();
		  testSBC( value );
		  break;
		case 0xea:                         // NOP
		  break;
		case 0xec:                         // CPX ABS
		  value = memReadByte( popWord() );
		  doCompare( regX, value );
		  break;
		case 0xed:                         // SBC ABS
		  addr = popWord();
		  value = memReadByte( addr );
		  testSBC( value );
		  break;
		case 0xee:                         // INC ABS
		  addr = popWord();
		  value = memReadByte( addr );
		  ++value;
		  value = (value)&0xff;
		  memStoreByte( addr, value );
		  if( value ) regP &= 0xfd; else regP |= 0x02;
		  if( value & 0x80 ) regP |= 0x80; else regP &= 0x7f;
		  break;
		case 0xf0:                         // BEQ
		  offset = popByte();
		  if( regP&2 ) jumpBranch( offset );
		  break;
		case 0xf1:                         // SBC INDY
		  zp = popByte();
		  addr = memReadByte(zp) + (memReadByte(zp+1)<<8);
		  value = memReadByte( addr + regY );
		  testSBC( value );
		  break;
		case 0xf5:                         // SBC ZPX
		  addr = (popByte() + regX)&0xff;
		  value = memReadByte( addr );
		  regP = (regP&0xfe)|(value&1);
		  testSBC( value );
		  break;
		case 0xf6:                         // INC ZPX
		  addr = popByte() + regX;
		  value = memReadByte( addr );
		  ++value;
		  value=value&0xff;
		  memStoreByte( addr, value );
		  if( value ) regP &= 0xfd; else regP |= 0x02;
		  if( value & 0x80 ) regP |= 0x80; else regP &= 0x7f;
		  break;
		case 0xf8:                         // SED
		  regP |= 8;
		  break;
	   case 0xf9:                          // SBC ABSY
		  addr = popWord();
		  value = memReadByte( addr + regY );
		  testSBC( value );
		  break;
		case 0xfd:                         // SBC ABSX
		  addr = popWord();
		  value = memReadByte( addr + regX );
		  testSBC( value );
		  break;
		case 0xfe: // INC ABSX
		  addr = popWord() + regX;
		  value = memReadByte( addr );
		  ++value;
		  value=value&0xff;
		  memStoreByte( addr, value );
		  if( value ) regP &= 0xfd; else regP |= 0x02;
		  if( value & 0x80 ) regP |= 0x80; else regP &= 0x7f;
		  break;
		default:
		  message( "Address $" + addr2hex(regPC) + " - unknown opcode " + opcode );
		  codeRunning = false;
		  break;
	  }

	  if( (regPC == 0) || (!codeRunning) ) {
		clearInterval( myInterval );
		message( "Program end at PC=$" + addr2hex( regPC-1 ) );
		codeRunning = false;
		$('#runButton').html('Run');
	//    document.getElementById( "hexdumpButton" ).disabled = false;
	//    document.getElementById( "submitCode" ).disabled = false;
	//    updateDisplayFull();
	  }
	}

	/*
	 *  updatePixelDisplay() - Updates the display at one pixel position
	 *
	 */

	function updateDisplayPixel( addr ) {
	  display[addr-0x200].background = palette[memory[addr] & 0x0f];
	}


	/*
	 *  updateDisplayFull() - Simply redraws the entire display according to memory
	 *  The colors are supposed to be identical with the C64's palette.
	 *
	 */

	function updateDisplayFull() {
	  for( y=0; y<32; y++ ) {
		for( x=0; x<32; x++ ) {
		  updateDisplayPixel( ((y<<5)+x) + 0x200 );
		}
	  }
	}

});

$(window).load(function() {
	$('#code').val(localStorage["code"]);
	$('.button-collapse').sideNav({
		closeOnClick: true
	});
});
