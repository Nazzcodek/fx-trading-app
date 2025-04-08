import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  BeforeInsert,
  BeforeUpdate,
} from 'typeorm';
import { Exclude } from 'class-transformer';
import * as bcrypt from 'bcrypt';
import { WalletBalance } from '../../wallet/entities/wallet-balance.entity';
import { Transaction } from '../../transaction/entities/transaction.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  @Exclude()
  password: string;

  @Column({ default: false })
  is_verified: boolean;

  @Column({ type: 'varchar', length: 255, nullable: true })
  @Exclude()
  verification_code: string | null;

  @Column({ type: 'datetime', nullable: true })
  @Exclude()
  verification_expires_at: Date | null;

  @OneToMany(() => WalletBalance, (walletBalance) => walletBalance.user)
  wallet_balances: WalletBalance[];

  @OneToMany(() => Transaction, (transaction) => transaction.user)
  transactions: Transaction[];

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @Exclude()
  private passwordChanged: boolean = false;

  setPassword(newPassword: string) {
    this.password = newPassword;
    this.passwordChanged = true;
  }

  @BeforeInsert()
  @BeforeUpdate()
  async hashPassword() {
    // Only hash if explicitly marked as changed or during insert
    if ((this.id ? this.passwordChanged : true) && this.password) {
      if (this.password.length < 60) {
        this.password = await bcrypt.hash(this.password, 10);
      }
      this.passwordChanged = false;
    }
  }

  async validatePassword(password: string): Promise<boolean> {
    return bcrypt.compare(password, this.password);
  }
}
