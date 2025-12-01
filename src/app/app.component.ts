import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CelerixHeaderComponent } from './shared/components/celerix-header/celerix-header.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  title = 'Project Celerix';
}
