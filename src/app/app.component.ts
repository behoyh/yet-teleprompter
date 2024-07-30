import { Component } from '@angular/core';
import { HttpClient} from '@angular/common/http';
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

  timestamps = [];

  private jsonUrl = 'assets/lyrics.json';
  constructor(private http: HttpClient) {
    http.get(this.jsonUrl).subscribe((data:any) => {
      this.wordsArray = data.couchPotato;
    });

    http.get('assets/timestamps.json').subscribe((data: any) => {
      this.timestamps = data;
    });
  }

  onStart(event: Event) {
    this.currentWords = this.wordsArray[0];
    this.lineHiglighter(0, 0, 0);
  }

  lineHiglighter(wordsi:number, ti:number, wordi:number) {
    
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
    });
  }

  sleep(ms:number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
