import { Component, Renderer2 } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { saveAs } from 'file-saver';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'Teleprompter app'
  wordsArray: any;

  currentWords = '';
  highlightedWords = '';

  timestamps = [] as number[];

  private unlistener!: () => void;

  private jsonUrl = 'assets/lyrics.json';
  constructor(private http: HttpClient, private renderer2: Renderer2) {
    http.get(this.jsonUrl).subscribe((data: any) => {
      this.wordsArray = data.couchPotato;
    });

    http.get('assets/timestamps.json').subscribe((data: any) => {
      this.timestamps = data;
    });
  }

  ngOnDestroy() {
    this.unlistener();
  }

  writefile(text: any, filename: string) {
    var a = document.createElement('a');
    a.setAttribute('href', 'data:text/plain;charset=utf-u,' + encodeURIComponent(text));
    a.setAttribute('download', filename);
    a.click();
  }

  onStart(event: Event) {
    this.currentWords = this.wordsArray[0];
    this.lineHiglighter(0, 0, 0);
  }

  lineHiglighter(wordsi: number, ti: number, wordi: number) {

    if (ti >= this.timestamps.length) {
      return;
    }

    if (wordi >= this.wordsArray[wordsi].length) {
      this.highlightedWords = '';
      wordsi++;
      if (wordsi >= this.wordsArray.length) {
        return;
      }
      this.currentWords = this.wordsArray[wordsi];
      wordi = 0;
    }

    this.sleep(this.timestamps[ti]).then(() => {
      this.highlightedWords += this.wordsArray[wordsi][wordi];
      ti++;
      wordi++;
      this.currentWords = this.currentWords.substring(1);
      this.lineHiglighter(wordsi, ti, wordi);
      this.unlistener = this.renderer2.listen("document", "keyup", (ev) => {
        ev.preventDefault();
        console.log(this.timestamps[ti])
        if (ev.keyCode === 38) {
          for (var i = ti; i < this.timestamps.length; i++) {
            if (this.timestamps[i] > 50) {
              this.timestamps[i] = this.timestamps[i] * 0.98
            }
          }
          this.saveFile(JSON.stringify(this.timestamps))
        }
        if (ev.keyCode === 40){
          for (var i = ti; i < this.timestamps.length; i++) {
            if (this.timestamps[i] < 2000){
              this.timestamps[i] = this.timestamps[i] * 1.02
            }
          }
          this.saveFile(JSON.stringify(this.timestamps))
        }
      });
    });
  }

  saveFile(bytes:any) {
    const blob = new Blob([bytes], { type: 'text/plain;charset=utf-8' });
    saveAs(blob, 'timestamps.json');
  }

  sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
