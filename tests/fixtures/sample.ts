/**
 * UserService handles all user-related operations.
 *
 * This service provides methods for creating, reading,
 * updating, and deleting users from the database.
 */

import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

// Entity imports
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

// Utility imports
import { hashPassword, comparePassword } from '../utils/crypto';
import { logger } from '../utils/logger';
import { validateEmail } from '../utils/validators';

@Injectable()
export class UserService {
  // Private repository reference
  private readonly userRepository: Repository<User>;

  /**
   * Constructor - injects the user repository
   */
  constructor(
    @InjectRepository(User)
    userRepository: Repository<User>,
  ) {
    this.userRepository = userRepository;
  }

  /**
   * Create a new user
   * @param createUserDto - The user data transfer object
   * @returns The created user
   */
  async create(createUserDto: CreateUserDto): Promise<User> {
    // Validate email format
    if (!validateEmail(createUserDto.email)) {
      throw new BadRequestException('Invalid email format');
    }

    // Check if user already exists
    const existingUser = await this.userRepository.findOne({
      where: { email: createUserDto.email },
    });

    // If user exists, throw error
    if (existingUser) {
      throw new BadRequestException('User with this email already exists');
    }

    // Hash the password before saving
    const hashedPassword = await hashPassword(createUserDto.password);

    // Create the user entity
    const user = this.userRepository.create({
      ...createUserDto,
      password: hashedPassword,
    });

    // Save to database
    const savedUser = await this.userRepository.save(user);

    // Log the creation
    logger.info(`User created: ${savedUser.id}`);

    // Return the saved user
    return savedUser;
  }

  /**
   * Find all users
   * @returns Array of all users
   */
  async findAll(): Promise<User[]> {
    // Get all users from database
    const users = await this.userRepository.find();

    // Return the users
    return users;
  }

  /**
   * Find a user by ID
   * @param id - The user ID
   * @returns The found user
   * @throws NotFoundException if user not found
   */
  async findOne(id: string): Promise<User> {
    // Find the user
    const user = await this.userRepository.findOne({
      where: { id },
    });

    // If not found, throw error
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    // Return the user
    return user;
  }

  /**
   * Update a user
   * @param id - The user ID
   * @param updateUserDto - The update data
   * @returns The updated user
   */
  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    // Find the existing user
    const user = await this.findOne(id);

    // If password is being updated, hash it
    if (updateUserDto.password) {
      updateUserDto.password = await hashPassword(updateUserDto.password);
    }

    // Merge the updates
    Object.assign(user, updateUserDto);

    // Save the updated user
    const updatedUser = await this.userRepository.save(user);

    // Log the update
    logger.info(`User updated: ${updatedUser.id}`);

    // Return the updated user
    return updatedUser;
  }

  /**
   * Delete a user
   * @param id - The user ID
   * @returns void
   */
  async remove(id: string): Promise<void> {
    // Find the user first
    const user = await this.findOne(id);

    // Delete the user
    await this.userRepository.remove(user);

    // Log the deletion
    logger.info(`User deleted: ${id}`);
  }
}
